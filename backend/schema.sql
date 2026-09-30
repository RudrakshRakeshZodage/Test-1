-- Agentic Dating: PostgreSQL / Supabase Schema Definition

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. People
CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    linkedin_url TEXT NOT NULL,
    instagram_url TEXT NOT NULL,
    linkedin_content JSONB DEFAULT '{}'::jsonb,
    instagram_content JSONB DEFAULT '{}'::jsonb,
    profile_image TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    verification_warning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Profiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL UNIQUE REFERENCES people(id) ON DELETE CASCADE,
    identity JSONB DEFAULT '{}'::jsonb,
    professional_interests JSONB DEFAULT '{}'::jsonb,
    hobbies JSONB DEFAULT '{}'::jsonb,
    projects JSONB DEFAULT '{}'::jsonb,
    topics JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    explicit_preferences JSONB DEFAULT '{}'::jsonb,
    signals JSONB DEFAULT '{}'::jsonb,
    evidence JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(1536),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Agents
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL UNIQUE REFERENCES people(id) ON DELETE CASCADE,
    system_prompt TEXT NOT NULL,
    memory JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Dates
CREATE TABLE IF NOT EXISTS dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_a_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_b_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress',
    messages JSONB DEFAULT '[]'::jsonb,
    shared_interests JSONB DEFAULT '[]'::jsonb,
    complementary_interests JSONB DEFAULT '[]'::jsonb,
    differences JSONB DEFAULT '[]'::jsonb,
    evidence JSONB DEFAULT '[]'::jsonb,
    assessment TEXT,
    confidence VARCHAR(50) DEFAULT 'high',
    compatibility_score FLOAT DEFAULT 0.0,
    current_turn INT DEFAULT 0,
    max_turns INT DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Rankings
CREATE TABLE IF NOT EXISTS rankings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    candidate_person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    position INT NOT NULL,
    strength VARCHAR(50) DEFAULT 'Moderate',
    compatibility_score FLOAT DEFAULT 0.0,
    reasons JSONB DEFAULT '[]'::jsonb,
    shared_interests JSONB DEFAULT '[]'::jsonb,
    complementary_interests JSONB DEFAULT '[]'::jsonb,
    conversation_evidence JSONB DEFAULT '[]'::jsonb,
    differences JSONB DEFAULT '[]'::jsonb,
    date_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_rankings_person_id ON rankings(person_id);
CREATE INDEX IF NOT EXISTS idx_dates_agents ON dates(agent_a_id, agent_b_id);
