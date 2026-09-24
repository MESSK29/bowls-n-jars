from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models.product import Product
from app.models.category import Category
from app.schemas import ProductResponse, ProductDetailResponse

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("")
def get_products(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None, description="Category slug or name"),
    material: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    q: Optional[str] = Query(None, description="Search query"),
    featured: Optional[bool] = Query(None),
    bestseller: Optional[bool] = Query(None),
    sort: Optional[str] = Query("popular", description="popular, newest, price_asc, price_desc, rating"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50)
):
    query = db.query(Product)

    if category and category.lower() != "all":
        # Check if matches category slug or category name
        cat = db.query(Category).filter(
            or_(Category.slug == category.lower(), Category.name.ilike(f"%{category}%"))
        ).first()
        if cat:
            query = query.filter(Product.category_id == cat.id)

    if material and material.lower() != "all":
        query = query.filter(Product.material.ilike(f"%{material}%"))

    if color and color.lower() != "all":
        query = query.filter(Product.color.ilike(f"%{color}%"))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if featured is not None:
        query = query.filter(Product.is_featured == featured)

    if bestseller is not None:
        query = query.filter(Product.is_bestseller == bestseller)

    if q:
        search = f"%{q}%"
        query = query.filter(
            or_(
                Product.name.ilike(search),
                Product.description.ilike(search),
                Product.material.ilike(search),
                Product.color.ilike(search)
            )
        )

    # Sorting
    if sort == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort == "newest":
        query = query.order_by(desc(Product.created_at))
    else:  # popular / default
        query = query.order_by(desc(Product.review_count), desc(Product.rating))

    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()

    # Convert products to serializable schemas
    return {
        "items": [ProductResponse.model_validate(p) for p in products],
        "total": total,
        "page": page,
        "limit": limit,
        "pages": (total + limit - 1) // limit if limit > 0 else 1
    }

@router.get("/{id_or_slug}", response_model=ProductDetailResponse)
def get_product(id_or_slug: str, db: Session = Depends(get_db)):
    product = None
    if id_or_slug.isdigit():
        product = db.query(Product).filter(Product.id == int(id_or_slug)).first()
    
    if not product:
        product = db.query(Product).filter(Product.slug == id_or_slug).first()

    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    return product
