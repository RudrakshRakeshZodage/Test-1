import sys
from backend.database import SessionLocal
from backend.seed_data import seed_database

def main():
    print("Seeding database with 25 realistic tech profiles, precomputed dates, and rankings...")
    db = SessionLocal()
    try:
        count = seed_database(db)
        print(f"Successfully seeded {count} demo profiles into the database!")
    except Exception as e:
        print(f"Error during database seed: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
