import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.user import User
from app.schemas import OrderCreate, OrderResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not order_in.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Order items cannot be empty")

    subtotal = 0.0
    items_to_create = []

    for item_in in order_in.items:
        product = db.query(Product).filter(Product.id == item_in.product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id {item_in.product_id} not found"
            )
        
        if product.stock < item_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.name}'. Available: {product.stock}"
            )
        
        # Deduct stock
        product.stock -= item_in.quantity
        item_total = product.price * item_in.quantity
        subtotal += item_total

        # First image or placeholder
        img = product.images[0] if product.images else None

        items_to_create.append({
            "product_id": product.id,
            "product_name": product.name,
            "price": product.price,
            "quantity": item_in.quantity,
            "image_url": img
        })

    # Calculations: Free shipping above $60, otherwise $6.50
    shipping_fee = 0.0 if subtotal >= 60.0 else 6.50
    tax = round(subtotal * 0.08, 2)
    total_amount = round(subtotal + shipping_fee + tax, 2)

    order_number = f"BNJ-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"

    order = Order(
        user_id=current_user.id,
        order_number=order_number,
        status="processing",
        subtotal=round(subtotal, 2),
        shipping_fee=shipping_fee,
        tax=tax,
        total_amount=total_amount,
        shipping_address=order_in.shipping_address,
        payment_method=order_in.payment_method,
        payment_status="paid" if order_in.payment_method in ["stripe", "razorpay"] else "pending",
        notes=order_in.notes
    )
    db.add(order)
    db.flush()

    for item_data in items_to_create:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data["product_id"],
            product_name=item_data["product_name"],
            price=item_data["price"],
            quantity=item_data["quantity"],
            image_url=item_data["image_url"]
        )
        db.add(order_item)

    db.commit()
    db.refresh(order)
    return order

@router.get("", response_model=List[OrderResponse])
def get_user_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders

@router.get("/{id_or_number}", response_model=OrderResponse)
def get_order_detail(
    id_or_number: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if id_or_number.isdigit():
        order = query.filter(Order.id == int(id_or_number)).first()
    else:
        order = query.filter(Order.order_number == id_or_number).first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Only owner or admin can view
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return order
