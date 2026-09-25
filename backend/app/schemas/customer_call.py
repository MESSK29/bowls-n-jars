from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models.customer_call import CallStatus, CallOutcome, BatchStatus

# --- Customers ---
class CustomerCallBase(BaseModel):
    customer_name: str
    phone_number: str
    source_image: Optional[str] = None
    extraction_status: Optional[str] = None
    
    call_status: CallStatus = CallStatus.PENDING
    call_outcome: CallOutcome = CallOutcome.PENDING
    
    conversation: Optional[str] = None
    feedback: Optional[str] = None
    customer_response: Optional[str] = None
    agent_notes: Optional[str] = None
    customer_interest: Optional[str] = None
    
    follow_up_required: bool = False
    follow_up_date: Optional[datetime] = None
    follow_up_notes: Optional[str] = None
    
    call_attempt_number: int = 1
    call_start_time: Optional[datetime] = None
    call_end_time: Optional[datetime] = None
    call_duration: Optional[str] = None
    
    recording_url: Optional[str] = None
    transcript: Optional[str] = None

class CustomerCallCreate(BaseModel):
    customer_name: str
    phone_number: str
    source_image: Optional[str] = None

class CustomerCallUpdate(BaseModel):
    customer_name: Optional[str] = None
    phone_number: Optional[str] = None
    call_status: Optional[CallStatus] = None
    call_outcome: Optional[CallOutcome] = None
    conversation: Optional[str] = None
    feedback: Optional[str] = None
    customer_response: Optional[str] = None
    agent_notes: Optional[str] = None
    customer_interest: Optional[str] = None
    follow_up_required: Optional[bool] = None
    follow_up_date: Optional[datetime] = None
    follow_up_notes: Optional[str] = None
    call_attempt_number: Optional[int] = None
    call_start_time: Optional[datetime] = None
    call_end_time: Optional[datetime] = None
    call_duration: Optional[str] = None
    recording_url: Optional[str] = None
    transcript: Optional[str] = None

class CustomerCallResponse(CustomerCallBase):
    id: int
    batch_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# --- Batches ---
class CallBatchBase(BaseModel):
    batch_name: str
    batch_date: datetime
    total_customers: int = 0
    completed_calls: int = 0
    failed_calls: int = 0
    status: BatchStatus = BatchStatus.PENDING
    google_sheet_id: Optional[str] = None
    google_sheet_url: Optional[str] = None
    google_sheet_tab_name: Optional[str] = None
    google_sheet_tab_id: Optional[str] = None

class CallBatchCreate(BaseModel):
    customers: List[CustomerCallCreate]

class CallBatchResponse(CallBatchBase):
    id: int
    created_at: datetime
    updated_at: datetime
    calls: List[CustomerCallResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class CallBatchSummary(CallBatchBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ExtractionResponse(BaseModel):
    customers: List[CustomerCallCreate]
