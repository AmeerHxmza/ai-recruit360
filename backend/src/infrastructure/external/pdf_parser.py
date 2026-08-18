import fitz  # PyMuPDF
import re
import logging
from src.core.exceptions import PDFParsingError

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts and sanitizes text from a PDF resume using PyMuPDF (fitz).
    Handles layout elements, ligatures, and multi-column formatting.
    """
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        full_text = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                full_text.append(text)

        doc.close()
        raw_text = "\n".join(full_text)

        # Normalize text: strip ligatures, unreadable non-ASCII artifacts, and excessive newlines
        clean_text = re.sub(r'[^\x00-\x7F]+', ' ', raw_text)
        clean_text = re.sub(r'\n{3,}', '\n\n', clean_text)
        clean_text = re.sub(r'[ \t]{2,}', ' ', clean_text).strip()

        if len(clean_text) < 30:
            raise PDFParsingError("Extracted text is empty or image-only scanned PDF without selectable text.")

        return clean_text
    except Exception as e:
        logger.error(f"PyMuPDF text extraction failed: {str(e)}")
        raise PDFParsingError(str(e))
