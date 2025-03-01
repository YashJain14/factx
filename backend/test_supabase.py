from util.supabase import supabase_client

def test_connection():
    try:
        # Try to list tables
        response = supabase_client.table('tweets').select('*').limit(1).execute()
        print("Connection successful!")
        print(f"Response: {response}")
        return True
    except Exception as e:
        print(f"Connection failed: {e}")
        return False

if __name__ == "__main__":
    test_connection()