import os
from dotenv import load_dotenv

load_dotenv()

from src.services.ai_agent import run_candidate_screening

def test_screening_pipeline():
    print("Testing 5-Stage Screening Pipeline (Knockout + 10 MCQs + HR Qs)...")
    
    sample_cv = """
    Ameer Hamza - Senior Full-Stack Engineer based in Lahore, Pakistan.
    Experience: 4 years building scalable Next.js applications, Python FastAPI microservices, PostgreSQL databases, Docker containers, and LangChain AI RAG agents.
    Skills: Python, TypeScript, React, Next.js, FastAPI, SQL, Git, REST APIs, Tailwind CSS.
    Projects: Developed real-time AI recruitment platform using OpenAI GPT-4, Supabase, and PyMuPDF text parsing.
    """

    saudi_job = """
    Role: Senior Software Engineer (On-site in Riyadh, Saudi Arabia)
    Department: Engineering
    Requirements: Must be based in Riyadh, Saudi Arabia or willing to relocate on-site immediately. Minimum 3 years Python, FastAPI, and SQL experience required.
    """

    print("\n--- TEST 1: Location Knockout (Candidate in Lahore vs On-Site Riyadh Job) ---")
    res1 = run_candidate_screening(resume_text=sample_cv, job_description=saudi_job, city="Lahore")
    print("Passed Knockout:", res1["passed_knockout"])
    print("Knockout Reason:", res1["knockout_reason"])

    us_remote_job = """
    Role: Remote Senior Full-Stack Developer
    Department: Engineering
    Requirements: Experience with Python, Next.js, FastAPI, and PostgreSQL. Remote position open worldwide.
    """

    print("\n--- TEST 2: Valid Screening (Remote Job Match) ---")
    res2 = run_candidate_screening(resume_text=sample_cv, job_description=us_remote_job, city="Lahore")
    print("Passed Knockout:", res2["passed_knockout"])
    print("Generated MCQs Count:", len(res2.get("mcq_data", [])))
    print("Generated HR Qs Count:", len(res2.get("hr_questions", [])))

    if res2.get("mcq_data"):
        print("\nSample MCQ #1:", res2["mcq_data"][0])
    if res2.get("hr_questions"):
        print("Sample HR Q #1:", res2["hr_questions"][0])

if __name__ == "__main__":
    test_screening_pipeline()
