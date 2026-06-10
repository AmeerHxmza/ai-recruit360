import os
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)

@app.get("/", response_class=HTMLResponse)
def index():
    response = supabase.table('todos').select("*").execute()
    todos = response.data

    html = '<h1>Todos</h1><ul>'
    for todo in todos:
        html += f'<li>{todo["name"]}</li>'
    html += '</ul>'

    return html

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
