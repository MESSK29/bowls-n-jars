from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)
    material = Column(String(100), nullable=True)  # Stoneware, Terracotta, Porcelain, Canvas, Stainless Steel
    color = Column(String(50), nullable=True)      # Terracotta, Sage, Sand, Charcoal, Cream
    dimensions = Column(String(100), nullable=True)
    capacity = Column(String(100), nullable=True)
    stock = Column(Integer, default=10)
    images = Column(JSON, default=list)            # List of image URLs
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    care_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")
    wishlist_items = relationship("Wishlist", back_populates="product", cascade="all, delete-orphan")
