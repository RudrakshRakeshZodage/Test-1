import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Person(Base):
    __tablename__ = "people"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    headline = Column(String(255), nullable=True, default="")
    linkedin_url = Column(Text, nullable=False)
    instagram_url = Column(Text, nullable=False)
    linkedin_content = Column(JSON, nullable=True, default=dict)
    instagram_content = Column(JSON, nullable=True, default=dict)
    profile_image = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, analyzed, verified, error
    verification_warning = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", back_populates="person", uselist=False, cascade="all, delete-orphan")
    agent = relationship("Agent", back_populates="person", uselist=False, cascade="all, delete-orphan")
    rankings_as_subject = relationship("Ranking", foreign_keys="Ranking.person_id", back_populates="person", cascade="all, delete-orphan")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    person_id = Column(String(36), ForeignKey("people.id"), nullable=False, unique=True)
    identity = Column(JSON, nullable=True, default=dict)
    professional_interests = Column(JSON, nullable=True, default=dict)
    hobbies = Column(JSON, nullable=True, default=dict)
    projects = Column(JSON, nullable=True, default=dict)
    topics = Column(JSON, nullable=True, default=list)
    skills = Column(JSON, nullable=True, default=list)
    explicit_preferences = Column(JSON, nullable=True, default=dict)
    signals = Column(JSON, nullable=True, default=dict)
    evidence = Column(JSON, nullable=True, default=dict)
    embedding = Column(JSON, nullable=True)  # Stored as list of floats
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="profile")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    person_id = Column(String(36), ForeignKey("people.id"), nullable=False, unique=True)
    system_prompt = Column(Text, nullable=False)
    memory = Column(JSON, nullable=True, default=dict)
    status = Column(String(50), default="active")
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", back_populates="agent")
    dates_as_agent_a = relationship("DateSession", foreign_keys="DateSession.agent_a_id", back_populates="agent_a")
    dates_as_agent_b = relationship("DateSession", foreign_keys="DateSession.agent_b_id", back_populates="agent_b")


class DateSession(Base):
    __tablename__ = "dates"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_a_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    agent_b_id = Column(String(36), ForeignKey("agents.id"), nullable=False)
    status = Column(String(50), default="in_progress")  # in_progress, completed, paused
    messages = Column(JSON, nullable=False, default=list)
    shared_interests = Column(JSON, nullable=True, default=list)
    complementary_interests = Column(JSON, nullable=True, default=list)
    differences = Column(JSON, nullable=True, default=list)
    evidence = Column(JSON, nullable=True, default=list)
    assessment = Column(Text, nullable=True, default="")
    confidence = Column(String(50), nullable=True, default="high")
    compatibility_score = Column(Float, nullable=True, default=0.0)
    current_turn = Column(Integer, default=0)
    max_turns = Column(Integer, default=8)
    created_at = Column(DateTime, default=datetime.utcnow)

    agent_a = relationship("Agent", foreign_keys=[agent_a_id], back_populates="dates_as_agent_a")
    agent_b = relationship("Agent", foreign_keys=[agent_b_id], back_populates="dates_as_agent_b")


class Ranking(Base):
    __tablename__ = "rankings"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    person_id = Column(String(36), ForeignKey("people.id"), nullable=False)
    candidate_person_id = Column(String(36), ForeignKey("people.id"), nullable=False)
    position = Column(Integer, nullable=False)
    strength = Column(String(50), nullable=False, default="Moderate")  # Strong, Moderate, Emerging
    compatibility_score = Column(Float, nullable=False, default=0.0)
    reasons = Column(JSON, nullable=False, default=list)
    shared_interests = Column(JSON, nullable=True, default=list)
    complementary_interests = Column(JSON, nullable=True, default=list)
    conversation_evidence = Column(JSON, nullable=True, default=list)
    differences = Column(JSON, nullable=True, default=list)
    date_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    person = relationship("Person", foreign_keys=[person_id], back_populates="rankings_as_subject")
    candidate_person = relationship("Person", foreign_keys=[candidate_person_id])
