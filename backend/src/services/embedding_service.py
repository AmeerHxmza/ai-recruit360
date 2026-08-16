from typing import List
from langchain_openai import OpenAIEmbeddings
from src.core.config import settings


def generate_resume_embedding(resume_text: str) -> List[float]:
    """
    Generates a 1536-dimensional vector embedding for candidate resume text
    using OpenAI's text-embedding-3-small model.
    """
    if not resume_text or len(resume_text.strip()) == 0:
        return []

    try:
        embeddings_model = OpenAIEmbeddings(
            model="text-embedding-3-small",
            api_key=settings.OPENAI_API_KEY
        )
        # Truncate text to fit within embedding token context
        truncated_text = resume_text[:4000].replace("\n", " ")
        vector = embeddings_model.embed_query(truncated_text)
        return vector
    except Exception as e:
        print(f"Embedding generation error (fallback): {e}")
        return []
