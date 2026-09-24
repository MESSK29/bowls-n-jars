from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.wishlist import Wishlist
from app.models.product import Product
from app.models.user import User
from app.schemas import WishlistResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])

@router.get("", response_model=List[WishlistResponse])
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()

@router.post("/{product_id}")
def toggle_wishlist_item(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"action": "removed", "product_id": product_id}
    else:
        item = Wishlist(user_id=current_user.id, product_id=product_id)
        db.add(item)
        db.commit()
        return {"action": "added", "product_id": product_id}
