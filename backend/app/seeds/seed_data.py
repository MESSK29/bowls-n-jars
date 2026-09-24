from sqlalchemy.orm import Session
from app.models.user import User
from app.models.category import Category
from app.models.product import Product
from app.models.review import Review
from app.models.order import Order, OrderItem
from app.core.security import get_password_hash

def seed_database(db: Session):
    # Check if already seeded
    if db.query(User).filter(User.email == "admin@bowlsnjars.com").first():
        print("Database already seeded. Skipping...")
        return

    print("Seeding database with Bowls 'N' Jars India catalog...")

    # 1. Users — Indian names, phone numbers, addresses
    admin_user = User(
        email="admin@bowlsnjars.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Ananya Iyer (Founder & Master Potter)",
        role="admin",
        phone="9876543210",
        address_json='{"house_flat": "Studio 12, Artisan Complex", "street": "Pottery Lane, Koramangala", "landmark": "Near Forum Mall", "city": "Bengaluru", "state": "Karnataka", "pin_code": "560034", "country": "India"}'
    )
    customer_user = User(
        email="customer@bowlsnjars.com",
        hashed_password=get_password_hash("customer123"),
        full_name="Priya Sharma",
        role="customer",
        phone="9845123456",
        address_json='{"house_flat": "Flat 302, Shivam Towers", "street": "14, Linking Road, Bandra West", "landmark": "Near Shoppers Stop", "city": "Mumbai", "state": "Maharashtra", "pin_code": "400050", "country": "India"}'
    )
    db.add_all([admin_user, customer_user])
    db.commit()
    db.refresh(admin_user)
    db.refresh(customer_user)

    # 2. Categories
    cat_ceramics = Category(
        name="Ceramics & Kitchenware",
        slug="ceramics-kitchenware",
        description="Wheel-thrown and hand-molded stoneware, bowls, jars, mugs, and tabletop essentials made for mindful daily Indian rituals.",
        image_url="https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1200&auto=format&fit=crop"
    )
    cat_school = Category(
        name="School & Workspace Essentials",
        slug="school-workspace-essentials",
        description="Tactile, durable everyday accessories including ceramic-lined tiffin boxes, water bottles, pencil pouches, and desk organisers.",
        image_url="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop"
    )
    db.add_all([cat_ceramics, cat_school])
    db.commit()
    db.refresh(cat_ceramics)
    db.refresh(cat_school)

    # 3. Products — INR prices, Indian dimensions/context
    products_data = [
        # --- CERAMICS & KITCHENWARE ---
        {
            "category_id": cat_ceramics.id,
            "name": "Artisan Ribbed Stoneware Bowl (Set of 4)",
            "slug": "artisan-ribbed-stoneware-bowl-set",
            "description": "Each bowl is hand-thrown with rich tactile ribs and finished in our signature satin cream glaze with exposed raw clay rims. Perfect for morning dalia, warm rasam, or hearty khichdi bowls.",
            "price": 2499,
            "compare_at_price": 2999,
            "material": "Stoneware",
            "color": "Cream",
            "dimensions": "16.5 cm D × 7.5 cm H",
            "capacity": "700 ml",
            "stock": 18,
            "images": [
                "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.9,
            "review_count": 24,
            "is_featured": True,
            "is_bestseller": True,
            "care_instructions": "Microwave and dishwasher safe. Avoid sudden thermal shocks. Not suitable for direct flame."
        },
        {
            "category_id": cat_ceramics.id,
            "name": "Sculptural Earth Jar with Cork Lid",
            "slug": "sculptural-earth-jar-with-cork-lid",
            "description": "An airtight handcrafted stoneware storage jar accented with a natural cork lid. Perfect for storing whole spices, loose-leaf chai, or homemade pickles away from light and air.",
            "price": 1699,
            "compare_at_price": 1999,
            "material": "Terracotta & Stoneware",
            "color": "Terracotta",
            "dimensions": "11.5 cm D × 15 cm H",
            "capacity": "950 ml",
            "stock": 14,
            "images": [
                "https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.8,
            "review_count": 19,
            "is_featured": True,
            "is_bestseller": True,
            "care_instructions": "Hand wash ceramic vessel; wipe cork lid clean with a damp cloth."
        },
        {
            "category_id": cat_ceramics.id,
            "name": "Speckled Sand Everyday Ceramic Mug",
            "slug": "speckled-sand-everyday-ceramic-mug",
            "description": "A comforting thumb-rest handle and organic speckled glaze make this your quintessential morning chai or filter coffee companion. Ergonomically weighted for superior heat retention.",
            "price": 999,
            "compare_at_price": None,
            "material": "Stoneware",
            "color": "Sand",
            "dimensions": "9 cm D × 10 cm H",
            "capacity": "350 ml",
            "stock": 25,
            "images": [
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 5.0,
            "review_count": 38,
            "is_featured": True,
            "is_bestseller": True,
            "care_instructions": "Dishwasher & microwave safe. Lead-free, BIS-certified food-safe glaze."
        },
        {
            "category_id": cat_ceramics.id,
            "name": "Matte Sage Wabi-Sabi Flower Vase",
            "slug": "matte-sage-wabi-sabi-flower-vase",
            "description": "Inspired by wabi-sabi aesthetics, this understated vase features an earthy, textured sage glaze that celebrates asymmetry and natural beauty. Gorgeous with marigolds or wildflowers.",
            "price": 1899,
            "compare_at_price": 2199,
            "material": "Terracotta",
            "color": "Sage",
            "dimensions": "12.7 cm D × 21.6 cm H",
            "capacity": "N/A",
            "stock": 9,
            "images": [
                "https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.7,
            "review_count": 11,
            "is_featured": False,
            "is_bestseller": False,
            "care_instructions": "Hand wash with mild soapy water. Do not submerge in water for prolonged periods."
        },
        {
            "category_id": cat_ceramics.id,
            "name": "Rustic Wide-Rim Thali & Katori Set",
            "slug": "rustic-wide-rim-thali-katori-set",
            "description": "A beautiful handcrafted stoneware thali with wide rim and matching katori, perfect for presenting your daily dal-chawal, sabzi, and roti in artisan style.",
            "price": 2199,
            "compare_at_price": 2599,
            "material": "Stoneware",
            "color": "Clay",
            "dimensions": "Thali: 24 cm D | Katori: 11 cm D × 5 cm H",
            "capacity": "Katori: 280 ml",
            "stock": 16,
            "images": [
                "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.9,
            "review_count": 15,
            "is_featured": False,
            "is_bestseller": True,
            "care_instructions": "Dishwasher, OTG (up to 180°C), and microwave safe."
        },
        {
            "category_id": cat_ceramics.id,
            "name": "Hand-Glazed Ghee Pot & Masala Dip Dish",
            "slug": "hand-glazed-ghee-pot-masala-dip",
            "description": "A refined kitchen countertop centerpiece — a ceramic ghee pot with an airtight stainless steel spoon-holder lid, paired with a matching shallow masala dip saucer. Perfect for Indian kitchens.",
            "price": 1499,
            "compare_at_price": None,
            "material": "Porcelain & Stoneware",
            "color": "Cream",
            "dimensions": "9 cm D × 19 cm H",
            "capacity": "480 ml",
            "stock": 12,
            "images": [
                "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.8,
            "review_count": 8,
            "is_featured": False,
            "is_bestseller": False,
            "care_instructions": "Dishwasher safe vessel. Hand wash stainless lid separately."
        },
        {
            "category_id": cat_ceramics.id,
            "name": "Terracotta Pinch Bowls & Spice Cellar (Set of 3)",
            "slug": "terracotta-pinch-bowls-spice-cellar",
            "description": "Miniature handcrafted nesting pinch bowls with raw clay exteriors and glazed food-safe interiors. Perfect for presenting jeera, hing, ajwain, and rock salt on your masala tray.",
            "price": 1199,
            "compare_at_price": 1399,
            "material": "Terracotta",
            "color": "Terracotta",
            "dimensions": "7.5 cm D × 4 cm H each",
            "capacity": "90 ml each",
            "stock": 22,
            "images": [
                "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.9,
            "review_count": 29,
            "is_featured": True,
            "is_bestseller": False,
            "care_instructions": "Hand wash recommended to preserve raw unglazed base. Not for direct heat."
        },
        {
            "category_id": cat_ceramics.id,
            "name": "Handthrown Kulhad Chai Cups (Set of 6)",
            "slug": "handthrown-kulhad-chai-cups-set",
            "description": "Inspired by the classic kulhad tradition of roadside chai, our artisanal take features a textured grip, earthy clay scent, and food-safe glaze interior — the perfect blend of nostalgia and modern hygiene.",
            "price": 1299,
            "compare_at_price": None,
            "material": "Stoneware",
            "color": "Sand",
            "dimensions": "7 cm D × 7 cm H each",
            "capacity": "150 ml each",
            "stock": 30,
            "images": [
                "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 5.0,
            "review_count": 42,
            "is_featured": True,
            "is_bestseller": True,
            "care_instructions": "Hand wash to preserve the artisan clay finish. Microwave safe. Not for direct flame."
        },

        # --- SCHOOL & WORKSPACE ESSENTIALS ---
        {
            "category_id": cat_school.id,
            "name": "Ceramic-Coated Insulated Tiffin Box",
            "slug": "ceramic-coated-insulated-tiffin-box",
            "description": "The ultimate everyday companion for students and professionals. Food-safe ceramic interior coating that never retains curry odours or metallic tastes, wrapped in a powder-coated sage shell with removable dividers and an airtight bamboo-finish lid. BPA-free.",
            "price": 1799,
            "compare_at_price": 2099,
            "material": "Ceramic-Lined Stainless Steel",
            "color": "Sage",
            "dimensions": "20 cm L × 13 cm W × 6.5 cm H",
            "capacity": "1000 ml",
            "stock": 20,
            "images": [
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1584992236310-6edddc08acff?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.9,
            "review_count": 31,
            "is_featured": True,
            "is_bestseller": True,
            "care_instructions": "Hand wash lid and body. Do not place in microwave. Dishwasher safe vessel."
        },
        {
            "category_id": cat_school.id,
            "name": "Matte Clay Thermal Water Bottle",
            "slug": "matte-clay-thermal-water-bottle",
            "description": "A 750 ml double-wall vacuum insulated bottle with a slip-resistant matte terracotta powder coat. Keeps nimbu pani cold for 24 hours and chai warm for 12 hours. BIS-marked food-safe steel interior.",
            "price": 1499,
            "compare_at_price": 1799,
            "material": "Stainless Steel & Silicone",
            "color": "Terracotta",
            "dimensions": "7 cm D × 27 cm H",
            "capacity": "750 ml",
            "stock": 30,
            "images": [
                "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.8,
            "review_count": 44,
            "is_featured": True,
            "is_bestseller": True,
            "care_instructions": "Hand wash inside with warm soapy water. Do not put in microwave or dishwasher."
        },
        {
            "category_id": cat_school.id,
            "name": "Waxed Canvas Geometry Pencil Pouch",
            "slug": "waxed-canvas-geometry-pencil-pouch",
            "description": "Heavy-duty waxed cotton canvas with brass YKK zipper and ceramic toggle pull. Fits 30+ pens and pencils, with a dedicated slot for a scale and eraser. Earthy tones coordinate with your entire setup.",
            "price": 799,
            "compare_at_price": 999,
            "material": "Waxed Canvas & Brass",
            "color": "Clay",
            "dimensions": "21 cm L × 9 cm W × 5 cm H",
            "capacity": "N/A",
            "stock": 35,
            "images": [
                "https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.7,
            "review_count": 18,
            "is_featured": False,
            "is_bestseller": False,
            "care_instructions": "Wipe clean with a damp cloth. Spot-treat stains with mild soap. Air dry flat."
        },
        {
            "category_id": cat_school.id,
            "name": "Terracotta Desk Organiser (3-Section)",
            "slug": "terracotta-desk-organiser-3-section",
            "description": "A heavyweight terracotta desk caddy hand-formed on a plaster mould, featuring three purpose-built sections: pens/pencils, a phone ledge, and a shallow tray for sticky notes and coins. A natural addition to any study desk.",
            "price": 1299,
            "compare_at_price": 1499,
            "material": "Terracotta",
            "color": "Terracotta",
            "dimensions": "22 cm L × 10 cm W × 12 cm H",
            "capacity": "N/A",
            "stock": 15,
            "images": [
                "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.6,
            "review_count": 12,
            "is_featured": False,
            "is_bestseller": False,
            "care_instructions": "Wipe with dry or barely damp cloth. Avoid water pooling in sections."
        },
        {
            "category_id": cat_school.id,
            "name": "Handmade Cotton Rag Notebook (A5, 200gsm)",
            "slug": "handmade-cotton-rag-notebook-a5",
            "description": "A beautifully textured A5 journal made from 100% recycled cotton rag paper — the same archival paper used by artists. Features a hand-stitched binding, earthy indigo block-printed cover, and 160 acid-free pages.",
            "price": 649,
            "compare_at_price": 799,
            "material": "Recycled Cotton Rag Paper",
            "color": "Cream",
            "dimensions": "A5 (14.8 cm × 21 cm), 160 pages",
            "capacity": "N/A",
            "stock": 50,
            "images": [
                "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=1000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.8,
            "review_count": 27,
            "is_featured": True,
            "is_bestseller": False,
            "care_instructions": "Keep away from moisture. Store flat to preserve binding."
        },
        {
            "category_id": cat_school.id,
            "name": "Studio Clay Mini Planter Pen Stand",
            "slug": "studio-clay-mini-planter-pen-stand",
            "description": "A dual-purpose artisan piece — functions as a pen/brush holder OR a small succulent planter on your study desk. Dipped in a two-tone terracotta and sage glaze that matches perfectly with your ceramics collection.",
            "price": 549,
            "compare_at_price": None,
            "material": "Stoneware",
            "color": "Terracotta",
            "dimensions": "8 cm D × 10 cm H",
            "capacity": "N/A",
            "stock": 28,
            "images": [
                "https://images.unsplash.com/photo-1518710843675-2540dd79065c?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.9,
            "review_count": 16,
            "is_featured": False,
            "is_bestseller": True,
            "care_instructions": "If used as a planter, ensure drainage hole is not blocked. Wipe exterior with dry cloth."
        },
        {
            "category_id": cat_school.id,
            "name": "Ceramic Magnetic Whiteboard Eraser Tray",
            "slug": "ceramic-magnetic-whiteboard-eraser-tray",
            "description": "A premium wall-mount ceramic tray with strong neodymium magnet backing — holds dry-erase markers, chalk pens, and erasers. Glazed in a clean slate white that blends with any home study or office whiteboard.",
            "price": 899,
            "compare_at_price": 1099,
            "material": "Stoneware & Neodymium",
            "color": "Sand",
            "dimensions": "25 cm L × 7 cm W × 3 cm H",
            "capacity": "N/A",
            "stock": 20,
            "images": [
                "https://images.unsplash.com/photo-1584473457406-6240486418e9?q=80&w=1000&auto=format&fit=crop"
            ],
            "rating": 4.5,
            "review_count": 7,
            "is_featured": False,
            "is_bestseller": False,
            "care_instructions": "Wipe with dry cloth. The magnet backing is permanent — do not submerge in water."
        },
    ]

    product_objects = []
    for p_data in products_data:
        p = Product(
            category_id=p_data["category_id"],
            name=p_data["name"],
            slug=p_data["slug"],
            description=p_data["description"],
            price=p_data["price"],
            compare_at_price=p_data.get("compare_at_price"),
            material=p_data.get("material"),
            color=p_data.get("color"),
            dimensions=p_data.get("dimensions"),
            capacity=p_data.get("capacity"),
            stock=p_data["stock"],
            images=p_data["images"],
            rating=p_data["rating"],
            review_count=p_data["review_count"],
            is_featured=p_data["is_featured"],
            is_bestseller=p_data["is_bestseller"],
            care_instructions=p_data.get("care_instructions"),
        )
        db.add(p)
        product_objects.append(p)

    db.commit()
    for p in product_objects:
        db.refresh(p)

    # 4. Reviews — Indian reviewer names
    reviews_data = [
        {
            "product_id": product_objects[0].id,
            "user_id": customer_user.id,
            "user_name": "Priya Sharma",
            "rating": 5,
            "comment": "Absolutely stunning quality! My morning dalia looks so beautiful in these bowls. The glaze is thick and the weight feels premium. Shipping was quick and they were packed excellently. Will definitely buy more!"
        },
        {
            "product_id": product_objects[0].id,
            "user_name": "Rohan Mehta",
            "rating": 5,
            "comment": "Bought these as a housewarming gift and the family was overjoyed. You can immediately feel the hand-thrown difference compared to mass-produced ceramics. Truly worth every rupee."
        },
        {
            "product_id": product_objects[1].id,
            "user_name": "Sunita Krishnan",
            "rating": 5,
            "comment": "Perfect for storing loose-leaf darjeeling tea. The cork lid seals beautifully and the terracotta stays cool even in Mumbai summers. This jar has become the centrepiece of my kitchen counter!"
        },
        {
            "product_id": product_objects[2].id,
            "user_id": customer_user.id,
            "user_name": "Priya Sharma",
            "rating": 5,
            "comment": "My filter coffee tastes 10x better in this mug! The sand glaze is stunning — I get compliments every time I have guests over. Already ordered two more as gifts."
        },
        {
            "product_id": product_objects[2].id,
            "user_name": "Aditya Nair",
            "rating": 5,
            "comment": "The heat retention on this mug is exceptional. My morning chai stays warm for almost an hour. The speckled finish looks even better in person than in photos."
        },
        {
            "product_id": product_objects[7].id,
            "user_name": "Kavya Reddy",
            "rating": 5,
            "comment": "Bought a set of kulhad chai cups for my parents and they absolutely love them! The earthy scent and the feel of sipping chai from these is incomparable. A beautiful gift for anyone who loves chai culture."
        },
        {
            "product_id": product_objects[8].id,
            "user_name": "Vikram Singh",
            "rating": 5,
            "comment": "This tiffin box is brilliant! My dal and sabzi stay fresh for 5-6 hours without any smell transfer. My colleagues in office are constantly asking me where I bought it. Great product!"
        },
        {
            "product_id": product_objects[9].id,
            "user_name": "Meera Patel",
            "rating": 5,
            "comment": "Perfect water bottle! Keeps my nimbu pani cold all day even during Rajasthan summers. The terracotta matte finish is gorgeous and doesn't feel slippery. No leakage whatsoever."
        },
        {
            "product_id": product_objects[13].id,
            "user_name": "Tanvi Joshi",
            "rating": 5,
            "comment": "The cotton rag paper is dreamy — writing on it feels luxurious. The block print cover is unique and the binding is strong. This is now my go-to journal for daily writing."
        },
    ]

    for r_data in reviews_data:
        r = Review(
            product_id=r_data["product_id"],
            user_id=r_data.get("user_id"),
            user_name=r_data["user_name"],
            rating=r_data["rating"],
            comment=r_data["comment"],
        )
        db.add(r)

    db.commit()

    # 5. Sample Orders with Indian addresses and Razorpay/UPI/COD
    order1 = Order(
        user_id=customer_user.id,
        order_number="BNJ-IN-00001",
        status="delivered",
        subtotal=3498,
        shipping_fee=0,
        tax=630,
        total_amount=3498,
        shipping_address={
            "full_name": "Priya Sharma",
            "phone": "9845123456",
            "house_flat": "Flat 302, Shivam Towers",
            "street": "14, Linking Road, Bandra West",
            "landmark": "Near Shoppers Stop",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pin_code": "400050",
            "country": "India"
        },
        payment_method="razorpay",
        payment_status="paid",
        notes="Please wrap in eco-friendly packaging.",
    )
    db.add(order1)
    db.commit()
    db.refresh(order1)

    order_item1 = OrderItem(
        order_id=order1.id,
        product_id=product_objects[2].id,
        product_name=product_objects[2].name,
        price=product_objects[2].price,
        quantity=2,
        image_url=product_objects[2].images[0] if product_objects[2].images else None,
    )
    order_item2 = OrderItem(
        order_id=order1.id,
        product_id=product_objects[9].id,
        product_name=product_objects[9].name,
        price=product_objects[9].price,
        quantity=1,
        image_url=product_objects[9].images[0] if product_objects[9].images else None,
    )
    db.add_all([order_item1, order_item2])

    order2 = Order(
        user_id=customer_user.id,
        order_number="BNJ-IN-00002",
        status="processing",
        subtotal=2499,
        shipping_fee=99,
        tax=450,
        total_amount=2598,
        shipping_address={
            "full_name": "Priya Sharma",
            "phone": "9845123456",
            "house_flat": "Flat 302, Shivam Towers",
            "street": "14, Linking Road, Bandra West",
            "landmark": "Near Shoppers Stop",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pin_code": "400050",
            "country": "India"
        },
        payment_method="upi",
        payment_status="paid",
    )
    db.add(order2)
    db.commit()
    db.refresh(order2)

    order_item3 = OrderItem(
        order_id=order2.id,
        product_id=product_objects[0].id,
        product_name=product_objects[0].name,
        price=product_objects[0].price,
        quantity=1,
        image_url=product_objects[0].images[0] if product_objects[0].images else None,
    )
    db.add(order_item3)
    db.commit()

    print(f"[OK] Bowls 'N' Jars India seed complete: {len(product_objects)} products, "
          f"{len(reviews_data)} reviews, 2 sample orders seeded successfully.")
