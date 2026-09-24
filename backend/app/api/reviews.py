from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.review import Review
from app.models.product import Product
from app.models.user import User
from app.schemas import ReviewCreate, ReviewResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/products/{product_id}/reviews", tags=["Reviews"])

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    product_id: int,
    review_in: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    review = Review(
        product_id=product.id,
        user_id=current_user.id,
        user_name=current_user.full_name,
        rating=max(1, min(5, review_in.rating)),
        comment=review_in.comment
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    # Recalculate product rating and review count
    stats = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count")
    ).filter(Review.product_id == product.id).first()

    if stats and stats.count:
        product.rating = round(float(stats.avg_rating), 1)
        product.review_count = int(stats.count)
        db.commit()

    return review
