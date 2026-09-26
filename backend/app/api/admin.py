from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import urllib.request
import re
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.order import Order
from app.models.user import User
from app.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    OrderResponse,
    OrderStatusUpdate,
    AdminStats,
    CategoryBase,
    CategoryResponse
)
from app.core.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

def extract_image_url(url: str) -> str:
    if not url:
        return url
    if any(url.lower().endswith(ext) for ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']):
        return url
    if "images.unsplash.com" in url or "image" in url.lower():
        return url
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8', errors='ignore')
            match = re.search(r'<meta[^>]*property=[\'"]og:image[\'"][^>]*content=[\'"]([^\'"]+)[\'"]', html, re.IGNORECASE)
            if not match:
                match = re.search(r'<meta[^>]*content=[\'"]([^\'"]+)[\'"][^>]*property=[\'"]og:image[\'"]', html, re.IGNORECASE)
            if match:
                return match.group(1)
    except Exception:
        pass
    return url

@router.get("/stats", response_model=AdminStats)
def get_admin_dashboard_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_orders = db.query(Order).count()
    revenue = db.query(func.sum(Order.total_amount)).filter(Order.payment_status == "paid").scalar() or 0.0
    total_products = db.query(Product).count()
    total_customers = db.query(User).filter(User.role == "customer").count()
    low_stock_count = db.query(Product).filter(Product.stock <= 5).count()
    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()

    return {
        "total_orders": total_orders,
        "total_revenue": round(float(revenue), 2),
        "total_products": total_products,
        "total_customers": total_customers,
        "low_stock_count": low_stock_count,
        "recent_orders": recent_orders
    }

@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(Order).order_by(Order.created_at.desc()).all()

from app.schemas import UserResponse

@router.get("/customers", response_model=List[UserResponse])
def get_all_customers(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return db.query(User).filter(User.role == "customer").order_by(User.created_at.desc()).all()

@router.patch("/orders/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    order.status = status_update.status
    db.commit()
    db.refresh(order)
    return order

@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    # Check if slug exists
    existing = db.query(Product).filter(Product.slug == product_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A product with this slug already exists"
        )
    
    dumped = product_in.model_dump()
    if dumped.get("images"):
        dumped["images"] = [extract_image_url(img) for img in dumped["images"]]
        
    product = Product(**dumped)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product

@router.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_in: ProductUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    update_data = product_in.model_dump(exclude_unset=True)
    if "images" in update_data and update_data["images"]:
        update_data["images"] = [extract_image_url(img) for img in update_data["images"]]
        
    for field, val in update_data.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    db.delete(product)
    db.commit()
    return None

@router.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryBase,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Category).filter(Category.slug == category_in.slug).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A category with this slug already exists"
        )
    
    category = Category(**category_in.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
