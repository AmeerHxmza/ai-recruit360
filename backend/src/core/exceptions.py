"""
Custom Domain Exceptions for AI-Recruit360 Backend Engine
"""

class DomainException(Exception):
    """Base exception for all domain business logic errors."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class CandidateNotFoundError(DomainException):
    def __init__(self, candidate_id: str):
        super().__init__(f"Candidate with ID '{candidate_id}' was not found.", status_code=404)


class JobNotFoundError(DomainException):
    def __init__(self, job_id: str):
        super().__init__(f"Job posting with ID '{job_id}' was not found.", status_code=404)


class JobExpiredError(DomainException):
    def __init__(self, job_title: str = "This position"):
        super().__init__(f"'{job_title}' has expired and is no longer accepting applications.", status_code=410)


class DuplicateApplicationError(DomainException):
    def __init__(self, email: str):
        super().__init__(f"Candidate '{email}' has already submitted an application for this position.", status_code=409)


class InsufficientCreditsError(DomainException):
    def __init__(self, required: int, available: int):
        super().__init__(
            f"Insufficient credits balance. Action requires {required} credits, but you only have {available} available.",
            status_code=402
        )


class AccountSuspendedError(DomainException):
    def __init__(self):
        super().__init__("Your recruiter account has been suspended by the platform administrator.", status_code=403)


class SessionExpiredError(DomainException):
    def __init__(self, session_id: str):
        super().__init__(f"Interview session '{session_id}' has expired or is invalid.", status_code=404)


class PDFParsingError(DomainException):
    def __init__(self, reason: str):
        super().__init__(f"Failed to process PDF resume: {reason}", status_code=422)
