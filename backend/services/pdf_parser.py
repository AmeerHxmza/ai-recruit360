import io
from pypdf import PdfReader


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts all text from a PDF file given its raw bytes.
    Returns a cleaned string with whitespace normalized.
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        pages = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
        full_text = "\n\n".join(pages)
        # Normalize whitespace
        lines = [line.strip() for line in full_text.splitlines() if line.strip()]
        return "\n".join(lines)
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}")
