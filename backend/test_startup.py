import sys
try:
    from main import app
    print("FastAPI app loaded successfully!")
    sys.exit(0)
except Exception as e:
    print(f"Failed to load FastAPI app: {e}")
    sys.exit(1)
