import requests

BASE_URL = "http://127.0.0.1:8000/api/v1"

print("--- Testing Authentication API ---\n")

def run():
    print("1. Admin Login (email)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"identifier": "admin@bowlsnjars.com", "password": "admin123"})
    print(res.status_code, res.json())
    
    print("\n2. User Login (email)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"identifier": "customer@bowlsnjars.com", "password": "customer123"})
    print(res.status_code, res.json())
    
    print("\n3. New Phone Registration...")
    reg_data = {
        "full_name": "Phone User",
        "phone": "+1234567890",
        "password": "mypassword123"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    print(res.status_code, res.json())
    
    print("\n4. Phone Login...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"identifier": "+1234567890", "password": "mypassword123"})
    print(res.status_code, res.json())
    
    print("\n5. Phone Login (Wrong Password)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"identifier": "+1234567890", "password": "wrongpassword"})
    print(res.status_code, res.json())
    
    print("\n6. Unregistered Phone Login...")
    res = requests.post(f"{BASE_URL}/auth/login", json={"identifier": "+999999999", "password": "somepassword"})
    print(res.status_code, res.json())
    
run()
