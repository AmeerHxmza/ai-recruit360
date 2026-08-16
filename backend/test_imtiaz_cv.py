import os
from dotenv import load_dotenv

load_dotenv()

from src.services.ai_agent import run_candidate_screening

def test_imtiaz_cv_knockout():
    print("Testing Imtiaz Khan HSE Officer CV against Software Engineering Job...")

    imtiaz_cv_text = """
    Imtiaz Khan
    HSE Officer (Aramco Approved)
    Jubail, Saudi Arabia / Pakistan
    CAREER OBJECTIVE:
    As a dedicated Safety Officer, I am deeply committed to fostering safe work environments through vigilance, critical thinking, and a passion for protecting people and processes. With a strong focus on task-oriented solutions, I approach challenges methodically, ensuring compliance with safety regulations while proactively identifying and mitigating risks.
    
    PROFESSIONAL EXPERIENCE:
    Safety Officer - Unisol Arabia (Tanajib Cogeneration, Client: Samsung)
    Safety Officer - Mohammed S. AL-SALEM (North GCP pipeline package #5, Client: Aramco)
    Safety Officer - Baytur Construction Co. (Phase MEP Administration building)
    
    CERTIFICATIONS & EDUCATION:
    NEBOSH IGC (International General Certificate in Occupational Health and Safety)
    IOSH Managing Safely
    OSHA 30-hour General Industry Standard
    HSE Diploma (3-Years) - International Board of Professional Skills
    """

    software_engineer_job = """
    Role: Senior Software Engineer (Python & React)
    Department: Engineering
    Requirements: Minimum 3+ years experience building web applications with Python, FastAPI, React, Next.js, PostgreSQL, and Git version control.
    """

    res = run_candidate_screening(resume_text=imtiaz_cv_text, job_description=software_engineer_job, city="Jubail")

    print("\n--- SCREENING EVALUATION RESULT ---")
    print("Passed Knockout:", res["passed_knockout"])
    print("Knockout Reason:", res["knockout_reason"])
    print("Generated MCQs Count:", len(res.get("mcq_data", [])))

    if not res["passed_knockout"]:
        print("\nSUCCESS: Imtiaz Khan's HSE Officer CV was correctly KNOCKED OUT!")
    else:
        print("\nFAILED: CV was not knocked out.")

if __name__ == "__main__":
    test_imtiaz_cv_knockout()
