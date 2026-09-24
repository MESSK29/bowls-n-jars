import sys
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_flow():
    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200, res.text
    print("[OK] Health check OK")

    # 2. Categories
    res = client.get("/api/categories")
    assert res.status_code == 200
    cats = res.json()
    assert len(cats) >= 2
    print(f"[OK] Categories loaded: {[c['name'] for c in cats]}")

    # 3. Products
    res = client.get("/api/products")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 16
    print(f"[OK] Products count: {data['total']}")

    # 4. Filter by category
    res = client.get("/api/products?category=ceramics-kitchenware")
    assert res.status_code == 200
    ceramics = res.json()
    assert ceramics["total"] >= 8
    print(f"[OK] Filter by category OK: {ceramics['total']} items")

    # 5. Product detail
    first_product = data["items"][0]
    res = client.get(f"/api/products/{first_product['slug']}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["name"] == first_product["name"]
    print(f"[OK] Product detail OK: {detail['name']}")

    # 6. Login as demo customer
    res = client.post("/api/auth/login", json={"email": "customer@bowlsnjars.com", "password": "customer123"})
    assert res.status_code == 200
    token_data = res.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Customer login OK")

    # 7. Create Order
    order_payload = {
        "items": [{"product_id": first_product["id"], "quantity": 1}],
        "shipping_address": {
            "full_name": "Maya Lin",
            "street": "108 Oak Crest Rd",
            "city": "Seattle",
            "state": "WA",
            "zip": "98101",
            "country": "United States"
        },
        "payment_method": "stripe"
    }
    res = client.post("/api/orders", json=order_payload, headers=headers)
    assert res.status_code == 201
    order = res.json()
    print(f"[OK] Order placed successfully: {order['order_number']}, total: ${order['total_amount']}")

    # 8. Admin login and stats
    res = client.post("/api/auth/login", json={"email": "admin@bowlsnjars.com", "password": "admin123"})
    assert res.status_code == 200
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    res = client.get("/api/admin/stats", headers=admin_headers)
    assert res.status_code == 200
    stats = res.json()
    print(f"[OK] Admin stats OK: {stats['total_orders']} orders, ${stats['total_revenue']} revenue")

    print("\nALL BACKEND API TESTS PASSED! SUCCESS")

if __name__ == "__main__":
    test_flow()
