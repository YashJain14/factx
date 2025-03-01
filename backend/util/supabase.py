import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]

print(f"Connecting to Supabase at: {SUPABASE_URL}")
print(f"API Key starts with: {SUPABASE_KEY[:5]}...")

supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Supabase client created")