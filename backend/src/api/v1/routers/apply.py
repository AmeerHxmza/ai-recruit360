from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from typing import Optional
from src.services.candidate_service import candidate_service
from src.core.exceptions import (
    JobNotFoundError,
    JobExpiredError,
    DuplicateApplicationError,
    PDFParsingError
)

router = APIRouter()


@router.post("/{job_id}")
async def submit_application(
    job_id: str,
    email: str = Form(...),
    name: Optional[str] = Form(None),
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    full_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    resume: Optional[UploadFile] = File(None)
):
    """
    Public Candidate Endpoint: Submits application with PDF resume.
    Enforces Candidate Duplicate Prevention & Job Duration Expiration checks.
    Executes PyMuPDF text parsing & LangGraph 3-Node screening graph.
    """
    target_file = file or resume
    if not target_file:
        raise HTTPException(status_code=422, detail="PDF resume file is required.")

    # Format first & last name
    raw_name = (first_name or name or full_name or "Applicant").strip()
    parts = raw_name.split(" ", 1)
    f_name = parts[0]
    l_name = last_name.strip() if last_name else (parts[1] if len(parts) > 1 else "Candidate")
    candidate_city = (city or address or "").strip()

    try:
        pdf_bytes = await target_file.read()
        filename = getattr(target_file, "filename", "resume.pdf")

        result = await candidate_service.process_candidate_application(
            job_id=job_id,
            first_name=f_name,
            last_name=l_name,
            email=email,
            pdf_bytes=pdf_bytes,
            filename=filename,
            phone=phone,
            gender=gender,
            city=candidate_city,
            github_url=github_url,
            linkedin_url=linkedin_url
        )

        return {
            "message": "Application submitted successfully.",
            "candidate_id": result["candidate_id"],
            "application_id": result["application_id"],
            "interview_id": result["interview_id"],
            "status": result["status"],
            "passed_knockout": result["passed_knockout"],
            "knockout_reason": result["knockout_reason"],
            "mcq_data": result["mcq_data"],
            "questions": result["questions"],
            "cv_url": result["cv_url"]
        }

    except JobNotFoundError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except JobExpiredError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except DuplicateApplicationError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except PDFParsingError as e:
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Application Processing Error: {str(e)}")
