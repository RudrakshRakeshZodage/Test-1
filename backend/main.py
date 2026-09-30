import os
import uuid
import logging
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import Base, engine, get_db
from backend.models import Person, Profile, Agent, DateSession, Ranking
from backend.schemas import (
    PersonCreate, PersonResponse, ProfileResponse, AgentResponse,
    DateCreate, DateSessionResponse, MessageItem,
    PersonRankingsResponse, RankingItemResponse, StatsResponse
)
from backend.services.scraper import (
    validate_linkedin_url, validate_instagram_url,
    extract_handle_or_slug, fetch_public_page_content,
    verify_identity_consistency
)
from backend.services.extractor import generate_profile_analysis
from backend.services.dating import (
    CONVERSATION_PHASES,
    generate_turn_openai, generate_turn_heuristic,
    analyze_completed_date
)
from backend.services.ranking import (
    compute_profile_vector,
    generate_personalized_rankings_for_person
)
from backend.seed_data import seed_database

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Agentic Dating: Autonomous AI Agents Dating from Public LinkedIn & Instagram Profiles",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Automatically seed 25 demo people on startup if database is empty
    db = next(get_db())
    try:
        count = db.query(Person).count()
        if count == 0:
            logger.info("Database is empty. Seeding 25 demo tech profiles...")
            seed_database(db)
            logger.info("Successfully seeded demo data.")
    except Exception as e:
        logger.error(f"Error during initial seed check: {e}")
    finally:
        db.close()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": settings.PROJECT_NAME}


@app.get("/api/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    people_count = db.query(Person).count()
    agents_count = db.query(Agent).count()
    dates_count = db.query(DateSession).count()
    rankings_count = db.query(Ranking).count()

    return StatsResponse(
        people_count=people_count,
        agents_count=agents_count,
        dates_count=dates_count,
        rankings_count=rankings_count,
        system_status="Operational"
    )


@app.post("/api/demo/seed")
def seed_demo_endpoint(db: Session = Depends(get_db)):
    """Seeds or resets the database with 25 precomputed realistic profiles and dates."""
    count = seed_database(db)
    return {"status": "success", "message": f"Successfully seeded {count} demo profiles."}


@app.get("/api/people", response_model=List[PersonResponse])
def list_people(
    search: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Person)
    if search:
        search_fmt = f"%{search.strip().lower()}%"
        query = query.filter(
            (Person.name.ilike(search_fmt)) |
            (Person.headline.ilike(search_fmt))
        )
    if status_filter and status_filter.lower() != "all":
        query = query.filter(Person.status == status_filter.lower())

    people = query.order_by(Person.created_at.desc()).all()
    
    result = []
    for p in people:
        interests_count = 0
        if p.profile and p.profile.skills:
            interests_count = len(p.profile.skills)
            if p.profile.hobbies and p.profile.hobbies.get("activities"):
                interests_count += len(p.profile.hobbies["activities"])

        dates_count = 0
        if p.agent:
            dates_count = db.query(DateSession).filter(
                (DateSession.agent_a_id == p.agent.id) |
                (DateSession.agent_b_id == p.agent.id)
            ).count()

        result.append(PersonResponse(
            id=p.id,
            name=p.name,
            headline=p.headline,
            linkedin_url=p.linkedin_url,
            instagram_url=p.instagram_url,
            profile_image=p.profile_image,
            status=p.status,
            verification_warning=p.verification_warning,
            created_at=p.created_at,
            extracted_interests_count=interests_count,
            completed_dates_count=dates_count,
            has_profile=p.profile is not None,
            has_agent=p.agent is not None
        ))
    return result


@app.post("/api/people", response_model=PersonResponse)
async def create_person(payload: PersonCreate, db: Session = Depends(get_db)):
    """
    Creates person from exactly two public sources: LinkedIn & Instagram.
    Validates URLs, attempts public retrieval, extracts structured profile,
    creates AI agent, and generates vector embedding.
    """
    # 1. URL Validation
    if not validate_linkedin_url(payload.linkedin_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid LinkedIn profile URL. Must be in the form https://www.linkedin.com/in/{username}"
        )
    if not validate_instagram_url(payload.instagram_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Instagram profile URL. Must be in the form https://www.instagram.com/{username}"
        )

    # 2. Extract handles
    li_slug = extract_handle_or_slug(payload.linkedin_url, "linkedin")
    ig_handle = extract_handle_or_slug(payload.instagram_url, "instagram")

    # Inferred person name
    person_name = payload.name
    if not person_name:
        # Derive from slug: e.g. alex-rivera-ai -> Alex Rivera
        cleaned_parts = [p.capitalize() for p in li_slug.replace("_", "-").split("-") if p.isalpha()]
        person_name = " ".join(cleaned_parts[:2]) if cleaned_parts else "Anonymous Professional"

    # 3. Public Web Content Retrieval
    li_data = await fetch_public_page_content(payload.linkedin_url)
    ig_data = await fetch_public_page_content(payload.instagram_url)

    # Use pasted fallback if provided by user (Live Mode Fallback)
    if payload.pasted_linkedin_content:
        li_data["raw_text"] = payload.pasted_linkedin_content
        li_data["status"] = "success"
    if payload.pasted_instagram_content:
        ig_data["raw_text"] = payload.pasted_instagram_content
        ig_data["status"] = "success"

    # 4. Identity Consistency Check
    is_consistent, warning = verify_identity_consistency(
        name=person_name,
        linkedin_slug=li_slug,
        linkedin_text=li_data.get("raw_text", ""),
        instagram_handle=ig_handle,
        instagram_text=ig_data.get("raw_text", "")
    )

    # Avatar image fallback
    avatar_image = li_data.get("image") or ig_data.get("image") or f"https://api.dicebear.com/7.x/avataaars/svg?seed={person_name}"

    # 5. Create Person in DB
    person = Person(
        name=person_name,
        headline=li_data.get("title", f"Professional on LinkedIn ({li_slug})"),
        linkedin_url=payload.linkedin_url,
        instagram_url=payload.instagram_url,
        linkedin_content=li_data,
        instagram_content=ig_data,
        profile_image=avatar_image,
        status="verified" if is_consistent else "pending",
        verification_warning=warning
    )
    db.add(person)
    db.flush()

    # 6. Extract Profile Analysis
    analysis = await generate_profile_analysis(person_name, li_data, ig_data)

    vector = compute_profile_vector({
        "skills": analysis.get("skills", []),
        "hobbies": analysis.get("hobbies", {}),
        "topics": analysis.get("topics", []),
        "identity": analysis.get("identity", {})
    })

    profile = Profile(
        person_id=person.id,
        identity=analysis.get("identity", {}),
        professional_interests=analysis.get("professional_interests", {}),
        hobbies=analysis.get("hobbies", {}),
        projects=analysis.get("projects", {}),
        topics=analysis.get("topics", []),
        skills=analysis.get("skills", []),
        explicit_preferences=analysis.get("explicit_preferences", {}),
        signals=analysis.get("signals", {}),
        evidence=analysis.get("evidence", {}),
        embedding=vector
    )
    db.add(profile)

    # 7. Create AI Agent
    system_prompt = (
        f"You are the autonomous dating agent representing {person.name}. "
        f"Ground your conversation strictly in these verified sources: "
        f"Headline: {person.headline}; Skills: {', '.join(profile.skills)}; "
        f"Hobbies: {', '.join(profile.hobbies.get('activities', []))}. "
        f"Never hallucinate private details or infer sensitive personal traits."
    )
    agent = Agent(
        person_id=person.id,
        system_prompt=system_prompt,
        memory={"profile_summary": person.headline},
        status="active"
    )
    db.add(agent)

    db.commit()
    db.refresh(person)

    # 8. Trigger personalized ranking generation for this person
    all_people = db.query(Person).all()
    generate_personalized_rankings_for_person(db, person, all_people)

    return PersonResponse(
        id=person.id,
        name=person.name,
        headline=person.headline,
        linkedin_url=person.linkedin_url,
        instagram_url=person.instagram_url,
        profile_image=person.profile_image,
        status=person.status,
        verification_warning=person.verification_warning,
        created_at=person.created_at,
        extracted_interests_count=len(profile.skills) + len(profile.hobbies.get("activities", [])),
        completed_dates_count=0,
        has_profile=True,
        has_agent=True
    )


@app.get("/api/people/{id}", response_model=PersonResponse)
def get_person(id: str, db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    interests_count = 0
    if person.profile and person.profile.skills:
        interests_count = len(person.profile.skills)
        if person.profile.hobbies and person.profile.hobbies.get("activities"):
            interests_count += len(person.profile.hobbies["activities"])

    dates_count = 0
    if person.agent:
        dates_count = db.query(DateSession).filter(
            (DateSession.agent_a_id == person.agent.id) |
            (DateSession.agent_b_id == person.agent.id)
        ).count()

    return PersonResponse(
        id=person.id,
        name=person.name,
        headline=person.headline,
        linkedin_url=person.linkedin_url,
        instagram_url=person.instagram_url,
        profile_image=person.profile_image,
        status=person.status,
        verification_warning=person.verification_warning,
        created_at=person.created_at,
        extracted_interests_count=interests_count,
        completed_dates_count=dates_count,
        has_profile=person.profile is not None,
        has_agent=person.agent is not None
    )


@app.post("/api/people/{id}/analyze", response_model=ProfileResponse)
async def analyze_person(id: str, db: Session = Depends(get_db)):
    """Re-analyzes public sources and rebuilds structured profile for person."""
    person = db.query(Person).filter(Person.id == id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    li_data = person.linkedin_content or await fetch_public_page_content(person.linkedin_url)
    ig_data = person.instagram_content or await fetch_public_page_content(person.instagram_url)

    analysis = await generate_profile_analysis(person.name, li_data, ig_data)

    if person.profile:
        person.profile.identity = analysis.get("identity", {})
        person.profile.professional_interests = analysis.get("professional_interests", {})
        person.profile.hobbies = analysis.get("hobbies", {})
        person.profile.projects = analysis.get("projects", {})
        person.profile.topics = analysis.get("topics", [])
        person.profile.skills = analysis.get("skills", [])
        person.profile.explicit_preferences = analysis.get("explicit_preferences", {})
        person.profile.signals = analysis.get("signals", {})
        person.profile.evidence = analysis.get("evidence", {})
        person.profile.embedding = compute_profile_vector({
            "skills": person.profile.skills,
            "hobbies": person.profile.hobbies,
            "topics": person.profile.topics,
            "identity": person.profile.identity
        })
    else:
        profile = Profile(
            person_id=person.id,
            identity=analysis.get("identity", {}),
            professional_interests=analysis.get("professional_interests", {}),
            hobbies=analysis.get("hobbies", {}),
            projects=analysis.get("projects", {}),
            topics=analysis.get("topics", []),
            skills=analysis.get("skills", []),
            explicit_preferences=analysis.get("explicit_preferences", {}),
            signals=analysis.get("signals", {}),
            evidence=analysis.get("evidence", {}),
            embedding=compute_profile_vector(analysis)
        )
        db.add(profile)

    person.status = "verified"
    db.commit()
    db.refresh(person.profile)
    return person.profile


@app.get("/api/people/{id}/profile", response_model=ProfileResponse)
def get_person_profile(id: str, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.person_id == id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile analysis not found for person")
    return profile


@app.post("/api/dates", response_model=DateSessionResponse)
def start_date(payload: DateCreate, db: Session = Depends(get_db)):
    """Initializes a new simulated date between two agents."""
    agent_a_id = payload.agent_a_id
    agent_b_id = payload.agent_b_id

    if payload.person_a_id:
        p_a = db.query(Person).filter(Person.id == payload.person_a_id).first()
        if p_a and p_a.agent:
            agent_a_id = p_a.agent.id
            
    if payload.person_b_id:
        p_b = db.query(Person).filter(Person.id == payload.person_b_id).first()
        if p_b and p_b.agent:
            agent_b_id = p_b.agent.id

    if not agent_a_id or not agent_b_id or agent_a_id == agent_b_id:
        raise HTTPException(status_code=400, detail="Two distinct valid agents are required for a date.")

    agent_a = db.query(Agent).filter(Agent.id == agent_a_id).first()
    agent_b = db.query(Agent).filter(Agent.id == agent_b_id).first()

    if not agent_a or not agent_b:
        raise HTTPException(status_code=404, detail="One or both agents could not be found.")

    date_session = DateSession(
        agent_a_id=agent_a.id,
        agent_b_id=agent_b.id,
        status="in_progress",
        messages=[],
        current_turn=0,
        max_turns=payload.max_turns or 8
    )
    db.add(date_session)
    db.commit()
    db.refresh(date_session)

    return _format_date_response(date_session, db)


@app.get("/api/dates", response_model=List[DateSessionResponse])
def list_dates(db: Session = Depends(get_db)):
    dates = db.query(DateSession).order_by(DateSession.created_at.desc()).all()
    return [_format_date_response(d, db) for d in dates]


@app.get("/api/dates/{id}", response_model=DateSessionResponse)
def get_date(id: str, db: Session = Depends(get_db)):
    date_session = db.query(DateSession).filter(DateSession.id == id).first()
    if not date_session:
        raise HTTPException(status_code=404, detail="Date session not found")
    return _format_date_response(date_session, db)


@app.post("/api/dates/{id}/continue", response_model=DateSessionResponse)
def continue_date_turn(id: str, db: Session = Depends(get_db)):
    """Generates the next conversation turn dynamically using AI / profile grounding."""
    date_session = db.query(DateSession).filter(DateSession.id == id).first()
    if not date_session:
        raise HTTPException(status_code=404, detail="Date session not found")

    if date_session.current_turn >= date_session.max_turns:
        date_session.status = "completed"
        db.commit()
        return _format_date_response(date_session, db)

    turn_index = date_session.current_turn
    phase = CONVERSATION_PHASES[turn_index % len(CONVERSATION_PHASES)]
    
    agent_a = date_session.agent_a
    agent_b = date_session.agent_b

    # Alternate speaking turns: Turn 0 (Agent A), Turn 1 (Agent B), Turn 2 (Agent A)...
    is_a_turn = (turn_index % 2 == 0)
    current_agent = agent_a if is_a_turn else agent_b
    other_agent = agent_b if is_a_turn else agent_a

    prof_curr = {
        "skills": current_agent.person.profile.skills if current_agent.person.profile else [],
        "hobbies": current_agent.person.profile.hobbies if current_agent.person.profile else {},
        "projects": current_agent.person.profile.projects if current_agent.person.profile else {},
        "topics": current_agent.person.profile.topics if current_agent.person.profile else [],
        "identity": current_agent.person.profile.identity if current_agent.person.profile else {}
    }

    prof_other = {
        "skills": other_agent.person.profile.skills if other_agent.person.profile else [],
        "hobbies": other_agent.person.profile.hobbies if other_agent.person.profile else {},
        "projects": other_agent.person.profile.projects if other_agent.person.profile else {},
        "topics": other_agent.person.profile.topics if other_agent.person.profile else [],
        "identity": other_agent.person.profile.identity if other_agent.person.profile else {}
    }

    # Generate turn message
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 10:
        try:
            msg_dict = generate_turn_openai(
                current_agent_name=current_agent.person.name,
                other_agent_name=other_agent.person.name,
                current_agent_profile=prof_curr,
                other_agent_profile=prof_other,
                history=date_session.messages or [],
                phase=phase,
                turn_index=turn_index
            )
        except Exception as e:
            logger.warning(f"OpenAI turn generation failed, falling back to heuristic: {e}")
            msg_dict = generate_turn_heuristic(
                current_agent_name=current_agent.person.name,
                other_agent_name=other_agent.person.name,
                current_agent_profile=prof_curr,
                other_agent_profile=prof_other,
                history=date_session.messages or [],
                phase=phase,
                turn_index=turn_index
            )
    else:
        msg_dict = generate_turn_heuristic(
            current_agent_name=current_agent.person.name,
            other_agent_name=other_agent.person.name,
            current_agent_profile=prof_curr,
            other_agent_profile=prof_other,
            history=date_session.messages or [],
            phase=phase,
            turn_index=turn_index
        )

    msg_dict["sender_id"] = current_agent.id
    msg_dict["sender_avatar"] = current_agent.person.profile_image

    current_messages = list(date_session.messages or [])
    current_messages.append(msg_dict)
    date_session.messages = current_messages
    date_session.current_turn = turn_index + 1

    # Check if finished
    if date_session.current_turn >= date_session.max_turns:
        date_session.status = "completed"
        analysis = analyze_completed_date(
            profile_a=prof_curr if is_a_turn else prof_other,
            profile_b=prof_other if is_a_turn else prof_curr,
            person_a_name=agent_a.person.name,
            person_b_name=agent_b.person.name,
            messages=date_session.messages
        )
        date_session.shared_interests = analysis["shared_interests"]
        date_session.complementary_interests = analysis["complementary_interests"]
        date_session.differences = analysis["differences"]
        date_session.evidence = analysis["evidence"]
        date_session.assessment = analysis["assessment"]
        date_session.compatibility_score = analysis["compatibility_score"]
        date_session.confidence = analysis["confidence"]

        # Regenerate rankings for both people to incorporate this fresh date!
        all_people = db.query(Person).all()
        generate_personalized_rankings_for_person(db, agent_a.person, all_people)
        generate_personalized_rankings_for_person(db, agent_b.person, all_people)

    db.commit()
    db.refresh(date_session)
    return _format_date_response(date_session, db)


@app.post("/api/dates/{id}/complete", response_model=DateSessionResponse)
def complete_date_session(id: str, db: Session = Depends(get_db)):
    """Forces completion and generates final compatibility analysis for date session."""
    date_session = db.query(DateSession).filter(DateSession.id == id).first()
    if not date_session:
        raise HTTPException(status_code=404, detail="Date session not found")

    date_session.status = "completed"
    
    agent_a = date_session.agent_a
    agent_b = date_session.agent_b
    
    prof_a = {
        "skills": agent_a.person.profile.skills if agent_a.person.profile else [],
        "hobbies": agent_a.person.profile.hobbies if agent_a.person.profile else {}
    }
    prof_b = {
        "skills": agent_b.person.profile.skills if agent_b.person.profile else [],
        "hobbies": agent_b.person.profile.hobbies if agent_b.person.profile else {}
    }

    analysis = analyze_completed_date(
        profile_a=prof_a,
        profile_b=prof_b,
        person_a_name=agent_a.person.name,
        person_b_name=agent_b.person.name,
        messages=date_session.messages or []
    )

    date_session.shared_interests = analysis["shared_interests"]
    date_session.complementary_interests = analysis["complementary_interests"]
    date_session.differences = analysis["differences"]
    date_session.evidence = analysis["evidence"]
    date_session.assessment = analysis["assessment"]
    date_session.compatibility_score = analysis["compatibility_score"]
    date_session.confidence = analysis["confidence"]

    db.commit()
    db.refresh(date_session)
    return _format_date_response(date_session, db)


@app.post("/api/rankings/generate")
def generate_rankings_endpoint(person_id: Optional[str] = None, db: Session = Depends(get_db)):
    """Triggers ranking engine recalculation for one person or all people."""
    all_people = db.query(Person).all()
    count = 0
    if person_id:
        person = db.query(Person).filter(Person.id == person_id).first()
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        generate_personalized_rankings_for_person(db, person, all_people)
        count = 1
    else:
        for p in all_people:
            generate_personalized_rankings_for_person(db, p, all_people)
            count += 1

    return {"status": "success", "message": f"Generated rankings for {count} people."}


@app.get("/api/rankings/{person_id}", response_model=PersonRankingsResponse)
def get_person_rankings(person_id: str, db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == person_id).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    rankings = db.query(Ranking).filter(Ranking.person_id == person_id).order_by(Ranking.position.asc()).all()

    # If no rankings exist yet, generate them on-the-fly!
    if not rankings:
        all_people = db.query(Person).all()
        rankings = generate_personalized_rankings_for_person(db, person, all_people)

    matches = []
    for r in rankings:
        cand = r.candidate_person
        if not cand:
            continue
        matches.append(RankingItemResponse(
            id=r.id,
            person_id=r.person_id,
            candidate_person_id=r.candidate_person_id,
            candidate_name=cand.name,
            candidate_headline=cand.headline or "",
            candidate_image=cand.profile_image,
            candidate_linkedin=cand.linkedin_url,
            candidate_instagram=cand.instagram_url,
            position=r.position,
            strength=r.strength,
            compatibility_score=r.compatibility_score,
            reasons=r.reasons or [],
            shared_interests=r.shared_interests or [],
            complementary_interests=r.complementary_interests or [],
            conversation_evidence=r.conversation_evidence or [],
            differences=r.differences or [],
            date_id=r.date_id
        ))

    return PersonRankingsResponse(
        person_id=person.id,
        person_name=person.name,
        person_headline=person.headline or "",
        person_image=person.profile_image,
        ranked_matches=matches
    )


def _format_date_response(d: DateSession, db: Session) -> DateSessionResponse:
    p_a = d.agent_a.person if d.agent_a else None
    p_b = d.agent_b.person if d.agent_b else None

    person_a_dict = {
        "id": p_a.id,
        "name": p_a.name,
        "headline": p_a.headline,
        "profile_image": p_a.profile_image,
        "skills": p_a.profile.skills if p_a and p_a.profile else [],
        "hobbies": p_a.profile.hobbies.get("activities", []) if p_a and p_a.profile and p_a.profile.hobbies else []
    } if p_a else None

    person_b_dict = {
        "id": p_b.id,
        "name": p_b.name,
        "headline": p_b.headline,
        "profile_image": p_b.profile_image,
        "skills": p_b.profile.skills if p_b and p_b.profile else [],
        "hobbies": p_b.profile.hobbies.get("activities", []) if p_b and p_b.profile and p_b.profile.hobbies else []
    } if p_b else None

    return DateSessionResponse(
        id=d.id,
        agent_a_id=d.agent_a_id,
        agent_b_id=d.agent_b_id,
        person_a=person_a_dict,
        person_b=person_b_dict,
        status=d.status,
        messages=d.messages or [],
        current_turn=d.current_turn,
        max_turns=d.max_turns,
        shared_interests=d.shared_interests or [],
        complementary_interests=d.complementary_interests or [],
        differences=d.differences or [],
        evidence=d.evidence or [],
        assessment=d.assessment or "",
        confidence=d.confidence or "high",
        compatibility_score=d.compatibility_score or 0.0,
        created_at=d.created_at
    )
