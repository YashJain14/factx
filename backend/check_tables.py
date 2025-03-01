from util.supabase import supabase_client

def check_tables():
    tables = ["tweets", "claims", "analyses", "keywords"]
    
    for table in tables:
        try:
            response = supabase_client.table(table).select('*').limit(1).execute()
            print(f"✅ Table '{table}' exists")
        except Exception as e:
            print(f"❌ Table '{table}' check failed: {e}")

if __name__ == "__main__":
    check_tables()