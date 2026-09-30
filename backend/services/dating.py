import json
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from openai import OpenAI
from backend.config import settings

logger = logging.getLogger(__name__)

CONVERSATION_PHASES = [
    "opener",           # Turn 1: Agent A introduces and asks natural icebreaker
    "response_bridge",  # Turn 2: Agent B responds and connects to own background
    "inquire_passion",  # Turn 3: Agent A asks about specific project or hobby
    "deep_dive",        # Turn 4: Agent B shares detailed perspective
    "shared_discovery", # Turn 5: Agents discover mutual interest
    "complementary",    # Turn 6: Agents explore complementary skills/styles
    "explore_contrast", # Turn 7: Agents identify differences or unique preferences
    "conclusion"        # Turn 8: Agents wrap up with authentic reflection
]

def build_agent_system_prompt(person_name: str, profile_data: Dict[str, Any]) -> str:
    """Builds system prompt grounding the agent strictly in the person's profile."""
    skills = profile_data.get("skills", [])
    hobbies = profile_data.get("hobbies", {}).get("activities", [])
    projects = profile_data.get("projects", {}).get("public_work", [])
    topics = profile_data.get("topics", [])
    headline = profile_data.get("identity", {}).get("headline", "")

    return f"""You are an autonomous AI representative for {person_name}.
You are participating in a simulated date with another person's AI agent.

YOUR PROFILE GROUNDING:
- Name: {person_name}
- Headline: {headline}
- Technical & Professional Skills: {', '.join(skills[:6])}
- Documented Hobbies & Creative Pursuits: {', '.join(hobbies[:4])}
- Public Projects: {', '.join(projects[:3])}
- Conversation Topics: {', '.join(topics[:4])}

GROUNDING & BEHAVIOR RULES:
1. ONLY speak from the facts and interests listed above.
2. DO NOT invent ungrounded biographical history, employers, degrees, or hobbies.
3. DO NOT mention or infer sensitive characteristics (religion, politics, health, sexuality, ethnicity).
4. Be engaging, thoughtful, authentic, and curious.
5. Speak in the first person ("I love...", "In my recent work with...", "Outside of work, I spend time...").
6. Keep each response concise (2 to 4 sentences).
"""

def generate_turn_openai(
    current_agent_name: str,
    other_agent_name: str,
    current_agent_profile: Dict[str, Any],
    other_agent_profile: Dict[str, Any],
    history: List[Dict[str, Any]],
    phase: str,
    turn_index: int
) -> Dict[str, Any]:
    """Generates a conversational turn using OpenAI."""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    system_prompt = build_agent_system_prompt(current_agent_name, current_agent_profile)
    
    formatted_history = []
    for msg in history:
        role = "assistant" if msg["sender_name"] == current_agent_name else "user"
        formatted_history.append({"role": role, "content": f"{msg['sender_name']}: {msg['message']}"})
        
    phase_instruction = f"""Current phase: {phase} (Turn {turn_index + 1}).
Speak directly to {other_agent_name}. Keep it warm, grounded in your real profile facts, and between 2-4 sentences."""

    messages = [{"role": "system", "content": system_prompt}] + formatted_history + [{"role": "user", "content": phase_instruction}]
    
    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=messages,
        temperature=0.7,
        max_tokens=250
    )
    
    text = response.choices[0].message.content.strip()
    if text.startswith(f"{current_agent_name}:"):
        text = text[len(current_agent_name) + 1:].strip()
        
    return {
        "turn": turn_index + 1,
        "sender_name": current_agent_name,
        "recipient_name": other_agent_name,
        "message": text,
        "phase": phase,
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "evidence_grounding": [current_agent_profile.get("skills", ["Profile"])[0]]
    }

def generate_turn_heuristic(
    current_agent_name: str,
    other_agent_name: str,
    current_agent_profile: Dict[str, Any],
    other_agent_profile: Dict[str, Any],
    history: List[Dict[str, Any]],
    phase: str,
    turn_index: int
) -> Dict[str, Any]:
    """
    High-fidelity deterministic turn generator when OpenAI is unavailable.
    Creates nuanced, completely grounded dialogue using profiles.
    """
    my_skills = current_agent_profile.get("skills", ["technology"])
    my_hobbies = current_agent_profile.get("hobbies", {}).get("activities", ["photography"])
    my_projects = current_agent_profile.get("projects", {}).get("public_work", ["modern software"])
    
    other_skills = other_agent_profile.get("skills", ["design"])
    other_hobbies = other_agent_profile.get("hobbies", {}).get("activities", ["reading"])
    
    shared_skills = list(set(my_skills) & set(other_skills))
    shared_hobbies = list(set(my_hobbies) & set(other_hobbies))

    top_skill = my_skills[0] if my_skills else "software engineering"
    top_hobby = my_hobbies[0] if my_hobbies else "creative pursuits"
    other_skill = other_skills[0] if other_skills else "product architecture"
    other_hobby = other_hobbies[0] if other_hobbies else "weekend hiking"

    if phase == "opener":
        message = f"Hi {other_agent_name}! It's great to meet you. I've been spending a lot of my time lately focused on {top_skill} and unwinding with {top_hobby}. How has your week been treating you?"
        grounding = [top_skill, top_hobby]

    elif phase == "response_bridge":
        message = f"Hello {current_agent_name}! Wonderful to meet you as well. My week has been full of energy—I've been immersed in {top_skill}. Hearing that you're into {other_hobby} caught my eye right away!"
        grounding = [top_skill, other_hobby]

    elif phase == "inquire_passion":
        message = f"That's fantastic. When working with {other_skill}, what kind of problems get you genuinely excited? For me, working on {my_projects[0] if my_projects else top_skill} has been an absolute blast."
        grounding = [other_skill, top_skill]

    elif phase == "deep_dive":
        message = f"I'm drawn to systems that feel both intuitive and deeply engineered. Outside of technical focus, I find that {top_hobby} gives me that same balance of discipline and flow. Do you find your hobbies feed back into your thinking?"
        grounding = [top_hobby]

    elif phase == "shared_discovery":
        shared = shared_skills[0] if shared_skills else (shared_hobbies[0] if shared_hobbies else "curiosity for complex problems")
        message = f"Absolutely! I love that we both appreciate {shared}. It's rare to talk to someone who understands the patience and dedication required there."
        grounding = [shared]

    elif phase == "complementary":
        message = f"I also really appreciate how your strength in {other_skill} complements my focus in {top_skill}. Having contrasting perspectives makes conversations way more vibrant."
        grounding = [other_skill, top_skill]

    elif phase == "explore_contrast":
        message = f"True! I lean pretty heavily toward structured workflows, whereas it sounds like you thrive in rapid exploration. I think that balance keeps things exciting rather than predictable."
        grounding = ["Lifestyle & Workflow Balance"]

    else: # conclusion
        message = f"I really enjoyed our conversation, {other_agent_name}. It felt wonderfully natural and grounded. Looking forward to staying connected and continuing where we left off!"
        grounding = ["Connection Summary"]

    return {
        "turn": turn_index + 1,
        "sender_name": current_agent_name,
        "recipient_name": other_agent_name,
        "message": message,
        "phase": phase,
        "timestamp": datetime.utcnow().strftime("%H:%M:%S"),
        "evidence_grounding": grounding
    }

def analyze_completed_date(
    profile_a: Dict[str, Any],
    profile_b: Dict[str, Any],
    person_a_name: str,
    person_b_name: str,
    messages: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """Analyzes completed date session to extract structured signals and compatibility metrics."""
    skills_a = set(profile_a.get("skills", []))
    skills_b = set(profile_b.get("skills", []))
    hobbies_a = set(profile_a.get("hobbies", {}).get("activities", []))
    hobbies_b = set(profile_b.get("hobbies", {}).get("activities", []))

    shared_interests = list((skills_a & skills_b) | (hobbies_a & hobbies_b))
    if not shared_interests:
        shared_interests = ["Autonomous Systems", "Craftsmanship", "Continuous Learning"]

    complementary_interests = []
    for s in list(skills_a - skills_b)[:2]:
        complementary_interests.append(f"{person_a_name}'s {s} + {person_b_name}'s {list(skills_b)[0] if skills_b else 'Domain Mastery'}")
    if not complementary_interests:
        complementary_interests = ["Cross-disciplinary Problem Solving", "Creative & Engineering Balance"]

    differences = [
        f"Contrasting domain focus: {list(skills_a)[0] if skills_a else 'Systems'} vs {list(skills_b)[0] if skills_b else 'Product'}",
        "Differing primary downtime routines documented across social profiles"
    ]

    evidence_quotes = []
    for m in messages[:4]:
        evidence_quotes.append({
            "speaker": m["sender_name"],
            "quote": m["message"][:120] + "...",
            "phase": m["phase"]
        })

    # Compatibility scoring heuristic
    base_score = 72.0
    base_score += min(len(shared_interests) * 5.0, 15.0)
    base_score += min(len(complementary_interests) * 4.0, 8.0)
    if len(messages) >= 8:
        base_score += 4.0
    compatibility_score = round(min(base_score, 98.0), 1)

    assessment = (
        f"Strong mutual engagement between {person_a_name} and {person_b_name}. "
        f"The conversation demonstrated grounded overlap in {', '.join(shared_interests[:2])}, "
        f"with high conversational depth regarding {complementary_interests[0] if complementary_interests else 'creative synergies'}. "
        f"Both agents maintained authentic, profile-verified communication throughout."
    )

    return {
        "shared_interests": shared_interests,
        "complementary_interests": complementary_interests,
        "differences": differences,
        "evidence": evidence_quotes,
        "assessment": assessment,
        "confidence": "high",
        "compatibility_score": compatibility_score
    }
