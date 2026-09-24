from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr

# Auth & User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    address_json: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int

    class Config:
        from_attributes = True

# Review Schemas
class ReviewBase(BaseModel):
    rating: int
    comment: str

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: int
    product_id: int
    user_id: Optional[int] = None
    user_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# Product Schemas
class ProductBase(BaseModel):
    name: str
    slug: str
    description: str
    price: float
    compare_at_price: Optional[float] = None
    category_id: Optional[int] = None
    material: Optional[str] = None
    color: Optional[str] = None
    dimensions: Optional[str] = None
    capacity: Optional[str] = None
    stock: int = 10
    images: List[str] = []
    is_featured: bool = False
    is_bestseller: bool = False
    care_instructions: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    category_id: Optional[int] = None
    material: Optional[str] = None
    color: Optional[str] = None
    dimensions: Optional[str] = None
    capacity: Optional[str] = None
    stock: Optional[int] = None
    images: Optional[List[str]] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    care_instructions: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    rating: float
    review_count: int
    created_at: datetime
    category: Optional[CategoryResponse] = None

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    reviews: List[ReviewResponse] = []

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    price: float
    quantity: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: dict
    payment_method: str = "stripe"
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    order_number: str
    status: str
    subtotal: float
    shipping_fee: float
    tax: float
    total_amount: float
    shipping_address: dict
    payment_method: str
    payment_status: str
    notes: Optional[str] = None
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

# Wishlist Schema
class WishlistResponse(BaseModel):
    id: int
    product_id: int
    product: ProductResponse
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Stats Schema
class AdminStats(BaseModel):
    total_orders: int
    total_revenue: float
    total_products: int
    total_customers: int
    low_stock_count: int
    recent_orders: List[OrderResponse]
