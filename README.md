# Bowls 'N' Jars 🏺
> *"Handcrafted Ceramics for Everyday Living"*

Bowls 'N' Jars is a full-stack, artisanal lifestyle e-commerce web platform showcasing handcrafted ceramic tableware and mindful school & workspace essentials. Built with React (TypeScript), Tailwind CSS, Framer Motion, Zustand, and a high-performance Python FastAPI backend backed by SQLAlchemy and JWT authentication.

---

## 🌟 Brand Context & Collections

1. **Ceramics & Kitchenware**:
   - Wheel-thrown ribbed bowls, minimalist speckled mugs, wabi-sabi vases, airtight cork storage jars, and olive oil cruets.
2. **School & Workspace Essentials**:
   - Ceramic-insulated lunch bento boxes, waxed organic canvas pencil pouches, double-walled thermal flasks, and heavy stoneware desk organizers.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript (Vite 8)
  - Tailwind CSS with customized earthy terracotta design tokens
  - Lucide React icons & Canvas Confetti for celebratory checkouts
  - Zustand for persistent cart, auth session, and wishlist state management
  - React Router v6
- **Backend**:
  - Python 3.11+
  - FastAPI (REST API with OpenAPI documentation at `/api/docs`)
  - SQLAlchemy 2.0 with relational schema (Users, Categories, Products, Reviews, Orders, OrderItems, Wishlists)
  - SQLite by default with instant plug-and-play zero configuration (PostgreSQL compatible via `DATABASE_URL`)
  - Pydantic v2 schemas and validation
  - Passlib & Bcrypt password hashing + JWT token authorization
  - Auto-seeding catalog script (16 detailed products, reviews, and test orders)

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Run backend server (auto-seeds database on first launch)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

- API Base URL: `http://localhost:8000/api`
- Swagger Interactive Documentation: `http://localhost:8000/api/docs`
- Database file `bowlsnjars.db` is automatically created and populated.

### 2. Frontend Setup & Run

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

- Web App: `http://localhost:5173`

---

## 🔑 Demo Credentials

For quick evaluation, convenient **one-click autofill buttons** are provided directly inside the Sign In modal:

| Role | Email | Password | Access Capabilities |
|---|---|---|---|
| **Demo Customer** | `customer@bowlsnjars.com` | `customer123` | Browsing, cart, wishlist, placing orders, leaving verified reviews, tracking shipment history |
| **Demo Administrator** | `admin@bowlsnjars.com` | `admin123` | Everything above + Admin Dashboard (`/admin`), product CRUD, inventory restocking, changing fulfillment status (`processing` → `shipped` → `delivered`) |

---

## 📦 Core Pages & Features

1. **Home Page (`/`)**:
   - Immersive hero banner with tagline and small-batch firing alert
   - Curated Dual Collection Bento (*Ceramics & Kitchenware* vs *School & Workspace Essentials*)
   - Best Sellers section with quick-add cards
   - Studio heritage story teaser ("Slow objects in an age of disposable speed")
   - Instagram community grid (`#BowlsNJarsAtHome`)
2. **Shop Catalog (`/shop`)**:
   - Sidebar filters by Category, Material (*Stoneware, Terracotta, Porcelain, Canvas, Stainless Steel*), Color (*Cream, Terracotta, Sand, Sage, Clay*), Price Range slider, and live full-text search
   - Sort dropdown (*Most Popular, Price: Low to High, Price: High to Low, Customer Rating, Newest Arrivals*)
   - Active filter chips with one-click reset
3. **Product Detail (`/product/:slug`)**:
   - High-resolution image gallery with thumbnail switcher
   - Real-time stock status indicator
   - Materials, capacity, dimensions, and food-safe badge breakdown
   - Quantity selector with instant basket feedback and wishlist toggle
   - Tabbed content: Craftsmanship Story, Dimensions, and Ceramic Care 101
   - Verified customer reviews with dynamic star rating submission form
   - Related products recommendation carousel
4. **Slide-Out Basket & Cart**:
   - Interactive sliding drawer with free shipping progress meter ($60 threshold)
   - Incremental quantity controls and subtotal calculation
5. **Checkout Page (`/checkout`)**:
   - Step 1: Shipping address with instant "Autofill Studio Address" button
   - Step 2: Payment method selection (Simulated Stripe Credit Card, Razorpay UPI/Netbanking, or Cash on Delivery)
   - Order summary with coupon code support (Enter `EARTH10` for 10% off)
   - Confetti burst celebration and formatted studio order receipt with tracking ID
6. **Account & Orders (`/account`)**:
   - Real-time order history with fulfillment status chips
   - Saved wishlist with direct "Move to Basket" buttons
   - Studio address management
7. **Our Story (`/about`)**:
   - The 5-stage wheel-throwing and kiln-firing timeline
   - Explanation of why we created School & Workspace Essentials
   - Ceramic Care 101 guide
8. **Contact & FAQ (`/contact`)**:
   - Direct message form to the potter
   - Interactive FAQ accordion covering lead-free certifications, odor prevention, and delivery guarantees
   - Portland Studio address and visiting hours
9. **Admin Dashboard (`/admin`)**:
   - Protected metrics: Gross Revenue, Total Orders, Active Catalog, Low Stock alerts
   - Product Management: Add, edit, delete, and restock catalog items
   - Order Fulfillment: Change order status from `processing` to `shipped` or `delivered`
