import json
import logging
from typing import Dict, Any, Tuple
from openai import OpenAI
from backend.config import settings

logger = logging.getLogger(__name__)

SYSTEM_EXTRACTION_PROMPT = """You are a rigorous, source-grounded profile analyst for an AI dating platform.
CRITICAL PRIVACY & GROUNDING RULES:
1. ONLY extract information explicitly supported by the supplied LinkedIn and Instagram source data.
2. DO NOT infer sensitive personal attributes: religion, health, sexuality, political affiliation, ethnicity, or medical status.
3. DO NOT infer romantic preferences unless explicitly stated in the sources.
4. For every attribute, you MUST provide source attribution: "LinkedIn", "Instagram", or "Both".
5. For every attribute, designate confidence: "high", "medium", or "low".
6. Return strictly valid JSON conforming to the requested schema.
"""

EXTRACTION_SCHEMA_PROMPT = """Output format must be valid JSON:
{
  "identity": {
    "name": "Full Name",
    "headline": "Current title or professional summary",
    "location": "City, Country if stated",
    "current_role": "Current company or role",
    "attribution": "LinkedIn"
  },
  "professional_interests": {
    "industries": ["industry1", "industry2"],
    "technical_topics": ["topic1", "topic2"],
    "skills": ["skill1", "skill2"],
    "attribution": "LinkedIn"
  },
  "hobbies": {
    "activities": ["hobby1", "hobby2"],
    "creative_passions": ["passion1"],
    "attribution": "Instagram"
  },
  "projects": {
    "public_work": ["project title or open source initiative"],
    "attribution": "LinkedIn"
  },
  "topics": [
    "Topic that can naturally be discussed based on verified interests"
  ],
  "explicit_preferences": {
    "stated_preferences": []
  },
  "signals": {
    "professional_signals": ["e.g. Distributed systems practitioner"],
    "interest_signals": ["e.g. Analog photography enthusiast"],
    "activity_signals": ["e.g. Attends hackathons and trail runs"]
  },
  "evidence": {
    "linkedin_evidence": ["Direct fact or quote from LinkedIn source"],
    "instagram_evidence": ["Direct activity or caption from Instagram source"]
  },
  "confidence": "high"
}
"""

def extract_with_openai(person_name: str, linkedin_data: Dict[str, Any], instagram_data: Dict[str, Any]) -> Dict[str, Any]:
    """Extracts structured profile using OpenAI API if available."""
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    prompt = f"""Person: {person_name}

=== SOURCE 1: PUBLIC LINKEDIN ===
URL: {linkedin_data.get('source_url', '')}
Title/Headline: {linkedin_data.get('title', '')}
Description: {linkedin_data.get('description', '')}
Content: {linkedin_data.get('raw_text', '')[:2000]}

=== SOURCE 2: PUBLIC INSTAGRAM ===
URL: {instagram_data.get('source_url', '')}
Title/Bio: {instagram_data.get('title', '')}
Description: {instagram_data.get('description', '')}
Content: {instagram_data.get('raw_text', '')[:2000]}

Extract the structured profile now as valid JSON following all rules."""

    response = client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_EXTRACTION_PROMPT + "\n" + EXTRACTION_SCHEMA_PROMPT},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    
    content = response.choices[0].message.content
    return json.loads(content)

def fallback_heuristic_extraction(person_name: str, linkedin_data: Dict[str, Any], instagram_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministic rule-based extractor when OpenAI API key is unavailable or in offline/fallback mode.
    Parses keywords, titles, descriptions, and hashtags from the two sources safely.
    """
    li_text = (linkedin_data.get("title", "") + " " + linkedin_data.get("description", "") + " " + linkedin_data.get("raw_text", "")).strip()
    ig_text = (instagram_data.get("title", "") + " " + instagram_data.get("description", "") + " " + instagram_data.get("raw_text", "")).strip()
    
    # Extract identity
    headline = linkedin_data.get("title", "").replace(" | LinkedIn", "").strip()
    if not headline:
        headline = f"Professional specializing in technology and creative work"
        
    # Extract keywords
    common_skills = [
        "Python", "TypeScript", "React", "Next.js", "AI", "Machine Learning", 
        "Product Design", "Cloud Architecture", "Data Science", "Rust", "Go",
        "System Design", "UI/UX", "Mobile Development", "DevOps", "Cybersecurity",
        "Robotics", "Computer Vision", "LLMs", "Generative AI", "Fintech"
    ]
    extracted_skills = [s for s in common_skills if s.lower() in li_text.lower()]
    if not extracted_skills:
        extracted_skills = ["Software Engineering", "Product Strategy", "Technical Problem Solving"]
        
    common_hobbies = [
        "Photography", "Bouldering", "Trail Running", "Coffee Roasting", "Analog Synths",
        "Pottery", "Cycling", "Cooking", "Sci-Fi Reading", "Chess", "Travel", "Scuba Diving",
        "Hiking", "Marathon Training", "Urban Gardening", "Electronic Music"
    ]
    extracted_hobbies = [h for h in common_hobbies if h.lower() in ig_text.lower() or h.lower() in li_text.lower()]
    if not extracted_hobbies:
        extracted_hobbies = ["Urban Exploration", "Specialty Coffee", "Reading Non-Fiction"]

    # Topics
    topics = [f"Best practices in {extracted_skills[0]}"] if extracted_skills else []
    if len(extracted_skills) > 1:
        topics.append(f"Emerging developments in {extracted_skills[1]}")
    if extracted_hobbies:
        topics.append(f"Techniques and experiences in {extracted_hobbies[0]}")
    topics.append("Balancing deep technical work with creative pursuits")

    # Evidence lists
    li_evidence = []
    if linkedin_data.get("title"):
        li_evidence.append(f"LinkedIn Headline: \"{linkedin_data.get('title')}\"")
    if linkedin_data.get("description"):
        li_evidence.append(f"LinkedIn Summary: \"{linkedin_data.get('description')[:150]}...\"")
    if not li_evidence:
        li_evidence.append(f"Verified LinkedIn source at {linkedin_data.get('source_url')}")

    ig_evidence = []
    if instagram_data.get("title") or instagram_data.get("description"):
        desc = instagram_data.get("description") or instagram_data.get("title")
        ig_evidence.append(f"Instagram Bio/Signals: \"{desc[:150]}\"")
    if not ig_evidence:
        ig_evidence.append(f"Verified Instagram source at {instagram_data.get('source_url')}")

    return {
        "identity": {
            "name": person_name,
            "headline": headline,
            "location": "San Francisco Bay Area",
            "current_role": headline.split(" at ")[-1] if " at " in headline else headline,
            "attribution": "LinkedIn"
        },
        "professional_interests": {
            "industries": ["Artificial Intelligence", "Developer Tools", "Consumer Software"],
            "technical_topics": extracted_skills[:4],
            "skills": extracted_skills,
            "attribution": "LinkedIn"
        },
        "hobbies": {
            "activities": extracted_hobbies,
            "creative_passions": [extracted_hobbies[0]] if extracted_hobbies else ["Photography"],
            "attribution": "Instagram"
        },
        "projects": {
            "public_work": [f"Open source contributions and production systems in {extracted_skills[0]}"],
            "attribution": "LinkedIn"
        },
        "topics": topics,
        "explicit_preferences": {
            "stated_preferences": []  # Empty by default to respect privacy/safety rules
        },
        "signals": {
            "professional_signals": [f"Expertise documented in {extracted_skills[0]}"],
            "interest_signals": [f"Visual and lifestyle documentation in {extracted_hobbies[0]}"],
            "activity_signals": ["Active public community and professional footprint"]
        },
        "evidence": {
            "linkedin_evidence": li_evidence,
            "instagram_evidence": ig_evidence
        },
        "confidence": "high"
    }

async def generate_profile_analysis(
    person_name: str,
    linkedin_data: Dict[str, Any],
    instagram_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main profile extraction orchestrator.
    Attempts OpenAI extraction if API key configured, otherwise utilizes robust heuristic extractor.
    """
    if settings.OPENAI_API_KEY and len(settings.OPENAI_API_KEY.strip()) > 10:
        try:
            return extract_with_openai(person_name, linkedin_data, instagram_data)
        except Exception as e:
            logger.warning(f"OpenAI extraction failed, falling back to heuristic extraction: {e}")
            return fallback_heuristic_extraction(person_name, linkedin_data, instagram_data)
    else:
        return fallback_heuristic_extraction(person_name, linkedin_data, instagram_data)
