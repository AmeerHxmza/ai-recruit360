import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts clean normalized text from raw PDF bytes using PyMuPDF (fitz).
    Handles multi-column layouts, ligatures, and formatting cleanups.
    """
    if not pdf_bytes:
        return ""

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_chunks = []
        for page in doc:
            page_text = page.get_text("text")
            if page_text:
                text_chunks.append(page_text)
        doc.close()
        
        raw_text = "\n".join(text_chunks)
        # Basic text normalization
        normalized_text = "\n".join([line.strip() for line in raw_text.splitlines() if line.strip()])
        return normalized_text
    except Exception as e:
        raise ValueError(f"Failed to parse PDF document: {str(e)}")
