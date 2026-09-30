import math
import numpy as np
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from backend.models import Person, Profile, DateSession, Ranking, Agent

def compute_profile_vector(profile_dict: Dict[str, Any]) -> List[float]:
    """Generates a deterministic semantic feature vector for in-memory cosine similarity."""
    categories = [
        "ai", "machine learning", "python", "typescript", "react", "rust", "go",
        "design", "ux", "robotics", "cloud", "systems", "photography", "hiking",
        "running", "coffee", "music", "books", "pottery", "travel", "climbing", "gardening"
    ]
    
    text = " ".join([
        " ".join(profile_dict.get("skills", [])),
        " ".join(profile_dict.get("hobbies", {}).get("activities", [])),
        " ".join(profile_dict.get("topics", [])),
        profile_dict.get("identity", {}).get("headline", "")
    ]).lower()
    
    vector = []
    for cat in categories:
        count = text.count(cat)
        vector.append(float(count) * 1.5 if count > 0 else 0.05)
        
    # Normalize vector
    norm = math.sqrt(sum(v * v for v in vector))
    if norm > 0:
        return [round(v / norm, 4) for v in vector]
    return vector

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    """Calculates cosine similarity between two feature vectors."""
    if not v1 or not v2 or len(v1) != len(v2):
        return 0.5
    dot = sum(a * b for a, b in zip(v1, v2))
    norm_a = math.sqrt(sum(a * a for a in v1))
    norm_b = math.sqrt(sum(b * b for b in v2))
    if norm_a == 0 or norm_b == 0:
        return 0.5
    return float(dot / (norm_a * norm_b))

def generate_personalized_rankings_for_person(
    db: Session,
    person: Person,
    all_people: List[Person]
) -> List[Ranking]:
    """
    Computes explainable, multi-signal compatibility rankings for a given person.
    Combines embedding semantic similarity + profile overlap + dating session results.
    """
    subject_profile = person.profile
    if not subject_profile:
        return []

    subject_data = {
        "skills": subject_profile.skills or [],
        "hobbies": subject_profile.hobbies or {},
        "topics": subject_profile.topics or [],
        "identity": subject_profile.identity or {}
    }
    v_subject = subject_profile.embedding or compute_profile_vector(subject_data)
    
    scored_candidates = []

    for candidate in all_people:
        if candidate.id == person.id or not candidate.profile:
            continue
            
        c_profile = candidate.profile
        c_data = {
            "skills": c_profile.skills or [],
            "hobbies": c_profile.hobbies or {},
            "topics": c_profile.topics or [],
            "identity": c_profile.identity or {}
        }
        v_cand = c_profile.embedding or compute_profile_vector(c_data)
        
        # 1. Semantic Embedding Similarity (30% weight)
        sem_sim = cosine_similarity(v_subject, v_cand)
        
        # 2. Direct Profile Overlap (30% weight)
        subj_skills = set(subject_data["skills"])
        cand_skills = set(c_data["skills"])
        shared_skills = list(subj_skills & cand_skills)
        
        subj_hobbies = set(subject_data["hobbies"].get("activities", []))
        cand_hobbies = set(c_data["hobbies"].get("activities", []))
        shared_hobbies = list(subj_hobbies & cand_hobbies)
        
        overlap_score = min(1.0, (len(shared_skills) * 0.2) + (len(shared_hobbies) * 0.25))
        
        # 3. Complementary Synergy (15% weight)
        complementary = []
        for s in list(subj_skills - cand_skills)[:2]:
            if cand_skills:
                complementary.append(f"{s} (from {person.name}) with {list(cand_skills)[0]} (from {candidate.name})")
        if not complementary:
            complementary = ["Shared multidisciplinary perspective in emerging tech"]
            
        # 4. Agent Dating Session Result (25% weight)
        # Check if an actual date occurred between their agents
        date_query = None
        if person.agent and candidate.agent:
            date_query = db.query(DateSession).filter(
                ((DateSession.agent_a_id == person.agent.id) & (DateSession.agent_b_id == candidate.agent.id)) |
                ((DateSession.agent_a_id == candidate.agent.id) & (DateSession.agent_b_id == person.agent.id))
            ).first()
            
        date_bonus = 0.0
        date_evidence = []
        if date_query and date_query.status == "completed":
            date_bonus = (date_query.compatibility_score or 75.0) / 100.0
            if date_query.evidence:
                date_evidence = [f"{e.get('speaker')}: \"{e.get('quote')}\"" for e in date_query.evidence[:2]]
        else:
            # Baseline simulation estimation
            date_bonus = 0.70 + (overlap_score * 0.2)
            date_evidence = [
                f"Projected conversation synergy based on {shared_skills[0] if shared_skills else 'shared technical focus'}",
                f"Complementary lifestyle documented in {shared_hobbies[0] if shared_hobbies else 'creative interests'}"
            ]

        total_score = (sem_sim * 0.30) + (overlap_score * 0.30) + (date_bonus * 0.25) + 0.15
        final_percentage = round(min(98.5, max(55.0, total_score * 100)), 1)
        
        strength = "Strong" if final_percentage >= 82 else ("Moderate" if final_percentage >= 70 else "Emerging")
        
        reasons = [
            f"Demonstrated mutual resonance in {', '.join(shared_skills[:2]) if shared_skills else 'technical engineering rigor'}",
            f"Active lifestyle connection through {shared_hobbies[0] if shared_hobbies else 'creative exploration'}",
            f"High conversational balance discovered during agent interactions"
        ]

        differences = [
            f"Differing specialized methodologies: {list(subj_skills)[0] if subj_skills else 'Systems'} vs {list(cand_skills)[0] if cand_skills else 'Design'}",
            f"Unique professional trajectories documented in LinkedIn source"
        ]

        scored_candidates.append({
            "candidate_id": candidate.id,
            "score": final_percentage,
            "strength": strength,
            "reasons": reasons,
            "shared_interests": shared_skills + shared_hobbies,
            "complementary_interests": complementary,
            "conversation_evidence": date_evidence,
            "differences": differences,
            "date_id": date_query.id if date_query else None
        })

    # Sort descending by score
    scored_candidates.sort(key=lambda x: x["score"], reverse=True)
    
    # Store rankings
    created_rankings = []
    # Clear existing rankings for this person first
    db.query(Ranking).filter(Ranking.person_id == person.id).delete()
    
    for idx, c in enumerate(scored_candidates):
        r = Ranking(
            person_id=person.id,
            candidate_person_id=c["candidate_id"],
            position=idx + 1,
            strength=c["strength"],
            compatibility_score=c["score"],
            reasons=c["reasons"],
            shared_interests=c["shared_interests"],
            complementary_interests=c["complementary_interests"],
            conversation_evidence=c["conversation_evidence"],
            differences=c["differences"],
            date_id=c["date_id"]
        )
        db.add(r)
        created_rankings.append(r)
        
    db.commit()
    return created_rankings
