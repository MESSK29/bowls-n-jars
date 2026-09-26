from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class BatchStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    FAILED = "Failed"

class CallStatus(str, enum.Enum):
    PENDING = "Pending"
    QUEUED = "Queued"
    CALLING = "Calling"
    COMPLETED = "Completed"
    FAILED = "Failed"
    NO_ANSWER = "No Answer"
    BUSY = "Busy"
    INVALID_NUMBER = "Invalid Number"
    CANCELLED = "Cancelled"

class CallOutcome(str, enum.Enum):
    INTERESTED = "Interested"
    NOT_INTERESTED = "Not Interested"
    FOLLOW_UP_REQUIRED = "Follow-up Required"
    REQUESTED_MORE_INFORMATION = "Requested More Information"
    CALL_BACK_LATER = "Call Back Later"
    NOT_RELEVANT = "Not Relevant"
    NO_RESPONSE = "No Response"
    OTHER = "Other"
    PENDING = "Pending" # Before outcome is known

class CallBatch(Base):
    __tablename__ = "customer_call_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_name = Column(String, index=True)
    batch_date = Column(DateTime)
    total_customers = Column(Integer, default=0)
    completed_calls = Column(Integer, default=0)
    failed_calls = Column(Integer, default=0)
    status = Column(String, default=BatchStatus.PENDING)
    google_sheet_id = Column(String, nullable=True)
    google_sheet_url = Column(String, nullable=True)
    google_sheet_tab_name = Column(String, nullable=True)
    google_sheet_tab_id = Column(String, nullable=True)
    agent_prompt = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    calls = relationship("CustomerCall", back_populates="batch", cascade="all, delete-orphan")

class CustomerCall(Base):
    __tablename__ = "customer_calls"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("customer_call_batches.id"), index=True)
    
    customer_name = Column(String)
    phone_number = Column(String, index=True)
    source_image = Column(String, nullable=True)
    
    # Call Data
    conversation = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    call_status = Column(String, default=CallStatus.PENDING, index=True)
    call_outcome = Column(String, default=CallOutcome.PENDING)
    
    customer_response = Column(Text, nullable=True)
    agent_notes = Column(Text, nullable=True)
    customer_interest = Column(String, nullable=True)
    
    follow_up_required = Column(Boolean, default=False)
    follow_up_date = Column(DateTime, nullable=True)
    follow_up_notes = Column(Text, nullable=True)
    
    call_attempt_number = Column(Integer, default=1)
    call_start_time = Column(DateTime(timezone=True), nullable=True)
    call_end_time = Column(DateTime(timezone=True), nullable=True)
    call_duration = Column(String, nullable=True) # e.g. "02:31"
    
    recording_url = Column(String, nullable=True)
    transcript = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    batch = relationship("CallBatch", back_populates="calls")
