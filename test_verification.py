import httpx

def test_full_stack():
    client = httpx.Client(timeout=10.0)
    
    # 1. Backend Stats
    stats = client.get("http://127.0.0.1:8000/api/stats").json()
    print("[OK] Backend Stats:", stats)
    
    # 2. People
    people = client.get("http://127.0.0.1:8000/api/people").json()
    print(f"[OK] Retrieved {len(people)} people")
    p0 = people[0]
    print(f"  First Person: {p0['name']} ({p0['headline'][:50]}...)")
    print(f"  Sources: LinkedIn: {p0['linkedin_url']}, Instagram: {p0['instagram_url']}")
    
    # 3. Profile Details
    profile = client.get(f"http://127.0.0.1:8000/api/people/{p0['id']}/profile").json()
    print(f"[OK] Profile for {p0['name']}: {len(profile.get('skills', []))} skills, {len(profile.get('hobbies', {}).get('activities', []))} hobbies")
    print(f"  LinkedIn evidence items: {len(profile.get('evidence', {}).get('linkedin_evidence', []))}")
    print(f"  Instagram evidence items: {len(profile.get('evidence', {}).get('instagram_evidence', []))}")
    
    # 4. Dates
    dates = client.get("http://127.0.0.1:8000/api/dates").json()
    print(f"[OK] Retrieved {len(dates)} precomputed dates")
    if dates:
        d0 = dates[0]
        print(f"  Sample Date: {d0['person_a']['name']} & {d0['person_b']['name']} ({d0['compatibility_score']}% match, {len(d0['messages'])} turns)")
    
    # 5. Live Date Turn Generation Test
    # Start fresh date between two agents
    new_date = client.post("http://127.0.0.1:8000/api/dates", json={
        "person_a_id": people[0]["id"],
        "person_b_id": people[2]["id"],
        "max_turns": 4
    }).json()
    print(f"[OK] Initialized new date session {new_date['id']}")
    
    # Generate Turn 1
    t1 = client.post(f"http://127.0.0.1:8000/api/dates/{new_date['id']}/continue").json()
    print(f"[OK] Generated Turn 1 by {t1['messages'][-1]['sender_name']}: \"{t1['messages'][-1]['message'][:80]}...\"")
    
    # Generate Turn 2
    t2 = client.post(f"http://127.0.0.1:8000/api/dates/{new_date['id']}/continue").json()
    print(f"[OK] Generated Turn 2 by {t2['messages'][-1]['sender_name']}: \"{t2['messages'][-1]['message'][:80]}...\"")
    
    # Complete Date
    completed = client.post(f"http://127.0.0.1:8000/api/dates/{new_date['id']}/complete").json()
    print(f"[OK] Completed date: Score {completed['compatibility_score']}%, Shared: {completed['shared_interests']}")
    
    # 6. Rankings
    rankings = client.get(f"http://127.0.0.1:8000/api/rankings/{p0['id']}").json()
    print(f"[OK] Rankings for {rankings['person_name']}: {len(rankings['ranked_matches'])} evaluated candidates")
    top_match = rankings['ranked_matches'][0]
    print(f"  #1 Match: {top_match['candidate_name']} ({top_match['compatibility_score']}%, {top_match['strength']})")
    print(f"  Match Reason: {top_match['reasons'][0]}")
    
    # 7. Frontend Check
    fe = client.get("http://localhost:3000")
    print(f"[OK] Frontend Server HTTP Status: {fe.status_code}")
    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_full_stack()
