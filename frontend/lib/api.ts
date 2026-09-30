export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Person {
  id: string;
  name: string;
  headline?: string;
  linkedin_url: string;
  instagram_url: string;
  profile_image?: string;
  status: "verified" | "analyzed" | "pending" | "error";
  verification_warning?: string;
  created_at: string;
  extracted_interests_count: number;
  completed_dates_count: number;
  has_profile: boolean;
  has_agent: boolean;
}

export interface ProfileData {
  id: string;
  person_id: string;
  identity: {
    name?: string;
    headline?: string;
    location?: string;
    current_role?: string;
    attribution?: string;
  };
  professional_interests: {
    industries?: string[];
    technical_topics?: string[];
    skills?: string[];
    attribution?: string;
  };
  hobbies: {
    activities?: string[];
    creative_passions?: string[];
    attribution?: string;
  };
  projects: {
    public_work?: string[];
    attribution?: string;
  };
  topics: string[];
  skills: string[];
  explicit_preferences: {
    stated_preferences?: string[];
  };
  signals: {
    professional_signals?: string[];
    interest_signals?: string[];
    activity_signals?: string[];
  };
  evidence: {
    linkedin_evidence?: string[];
    instagram_evidence?: string[];
  };
  confidence?: string;
  created_at: string;
}

export interface DateMessage {
  turn: number;
  sender_id?: string;
  sender_name: string;
  sender_avatar?: string;
  recipient_name: string;
  message: string;
  phase: string;
  timestamp: string;
  evidence_grounding?: string[];
}

export interface DateSession {
  id: string;
  agent_a_id: string;
  agent_b_id: string;
  person_a?: {
    id: string;
    name: string;
    headline?: string;
    profile_image?: string;
    skills?: string[];
    hobbies?: string[];
  };
  person_b?: {
    id: string;
    name: string;
    headline?: string;
    profile_image?: string;
    skills?: string[];
    hobbies?: string[];
  };
  status: "in_progress" | "completed" | "paused";
  messages: DateMessage[];
  current_turn: number;
  max_turns: number;
  shared_interests: string[];
  complementary_interests: string[];
  differences: string[];
  evidence: { speaker: string; quote: string; phase?: string }[];
  assessment: string;
  confidence: string;
  compatibility_score: number;
  created_at: string;
}

export interface RankingItem {
  id: string;
  person_id: string;
  candidate_person_id: string;
  candidate_name: string;
  candidate_headline: string;
  candidate_image?: string;
  candidate_linkedin?: string;
  candidate_instagram?: string;
  position: number;
  strength: "Strong" | "Moderate" | "Emerging";
  compatibility_score: number;
  reasons: string[];
  shared_interests: string[];
  complementary_interests: string[];
  conversation_evidence: string[];
  differences: string[];
  date_id?: string;
}

export interface PersonRankings {
  person_id: string;
  person_name: string;
  person_headline: string;
  person_image?: string;
  ranked_matches: RankingItem[];
}

export interface Stats {
  people_count: number;
  agents_count: number;
  dates_count: number;
  rankings_count: number;
  system_status: string;
}

export async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE_URL}/api/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchPeople(search?: string, filter?: string): Promise<Person[]> {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (filter && filter !== "all") params.set("status_filter", filter);
  
  const res = await fetch(`${API_BASE_URL}/api/people?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch people");
  return res.json();
}

export async function fetchPerson(id: string): Promise<Person> {
  const res = await fetch(`${API_BASE_URL}/api/people/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch person");
  return res.json();
}

export async function fetchPersonProfile(id: string): Promise<ProfileData> {
  const res = await fetch(`${API_BASE_URL}/api/people/${id}/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch person profile");
  return res.json();
}

export async function createPerson(data: {
  linkedin_url: string;
  instagram_url: string;
  name?: string;
  pasted_linkedin_content?: string;
  pasted_instagram_content?: string;
}): Promise<Person> {
  const res = await fetch(`${API_BASE_URL}/api/people`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create person");
  }
  return res.json();
}

export async function analyzePerson(id: string): Promise<ProfileData> {
  const res = await fetch(`${API_BASE_URL}/api/people/${id}/analyze`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to analyze person");
  return res.json();
}

export async function fetchDates(): Promise<DateSession[]> {
  const res = await fetch(`${API_BASE_URL}/api/dates`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch dates");
  return res.json();
}

export async function fetchDate(id: string): Promise<DateSession> {
  const res = await fetch(`${API_BASE_URL}/api/dates/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch date");
  return res.json();
}

export async function startDate(personAId: string, personBId: string, maxTurns = 8): Promise<DateSession> {
  const res = await fetch(`${API_BASE_URL}/api/dates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ person_a_id: personAId, person_b_id: personBId, max_turns: maxTurns }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to start date");
  }
  return res.json();
}

export async function continueDateTurn(id: string): Promise<DateSession> {
  const res = await fetch(`${API_BASE_URL}/api/dates/${id}/continue`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to continue date turn");
  return res.json();
}

export async function completeDate(id: string): Promise<DateSession> {
  const res = await fetch(`${API_BASE_URL}/api/dates/${id}/complete`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to complete date");
  return res.json();
}

export async function fetchPersonRankings(personId: string): Promise<PersonRankings> {
  const res = await fetch(`${API_BASE_URL}/api/rankings/${personId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch rankings");
  return res.json();
}

export async function triggerSeedDemo(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/demo/seed`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to seed demo data");
  return res.json();
}
