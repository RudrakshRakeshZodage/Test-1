from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, HttpUrl, Field

class PersonCreate(BaseModel):
    linkedin_url: str = Field(..., description="Public LinkedIn profile URL")
    instagram_url: str = Field(..., description="Public Instagram profile URL")
    name: Optional[str] = Field(None, description="Optional person name if known upfront")
    pasted_linkedin_content: Optional[str] = Field(None, description="Fallback pasted public profile text for LinkedIn")
    pasted_instagram_content: Optional[str] = Field(None, description="Fallback pasted public profile text for Instagram")

class PersonUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    profile_image: Optional[str] = None
    status: Optional[str] = None

class PersonResponse(BaseModel):
    id: str
    name: str
    headline: Optional[str] = ""
    linkedin_url: str
    instagram_url: str
    profile_image: Optional[str] = None
    status: str
    verification_warning: Optional[str] = None
    created_at: datetime
    extracted_interests_count: int = 0
    completed_dates_count: int = 0
    has_profile: bool = False
    has_agent: bool = False

    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    id: str
    person_id: str
    identity: Dict[str, Any] = {}
    professional_interests: Dict[str, Any] = {}
    hobbies: Dict[str, Any] = {}
    projects: Dict[str, Any] = {}
    topics: List[str] = []
    skills: List[str] = []
    explicit_preferences: Dict[str, Any] = {}
    signals: Dict[str, Any] = {}
    evidence: Dict[str, Any] = {}
    created_at: datetime

    class Config:
        from_attributes = True

class AgentResponse(BaseModel):
    id: str
    person_id: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DateCreate(BaseModel):
    person_a_id: Optional[str] = None
    person_b_id: Optional[str] = None
    agent_a_id: Optional[str] = None
    agent_b_id: Optional[str] = None
    max_turns: Optional[int] = 8

class MessageItem(BaseModel):
    turn: int
    sender_id: str
    sender_name: str
    sender_avatar: Optional[str] = None
    recipient_name: str
    message: str
    phase: str
    timestamp: str
    evidence_grounding: Optional[List[str]] = []

class DateSessionResponse(BaseModel):
    id: str
    agent_a_id: str
    agent_b_id: str
    person_a: Optional[Dict[str, Any]] = None
    person_b: Optional[Dict[str, Any]] = None
    status: str
    messages: List[Dict[str, Any]] = []
    current_turn: int
    max_turns: int
    shared_interests: List[str] = []
    complementary_interests: List[str] = []
    differences: List[str] = []
    evidence: List[Dict[str, Any]] = []
    assessment: Optional[str] = ""
    confidence: Optional[str] = "high"
    compatibility_score: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

class RankingItemResponse(BaseModel):
    id: str
    person_id: str
    candidate_person_id: str
    candidate_name: str
    candidate_headline: str
    candidate_image: Optional[str] = None
    candidate_linkedin: Optional[str] = None
    candidate_instagram: Optional[str] = None
    position: int
    strength: str
    compatibility_score: float
    reasons: List[str]
    shared_interests: List[str]
    complementary_interests: List[str]
    conversation_evidence: List[str]
    differences: List[str]
    date_id: Optional[str] = None

class PersonRankingsResponse(BaseModel):
    person_id: str
    person_name: str
    person_headline: str
    person_image: Optional[str] = None
    ranked_matches: List[RankingItemResponse]

class StatsResponse(BaseModel):
    people_count: int
    agents_count: int
    dates_count: int
    rankings_count: int
    system_status: str
