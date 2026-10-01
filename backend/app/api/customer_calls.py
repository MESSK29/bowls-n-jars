import os
import shutil
import time
from typing import List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User
from app.models.customer_call import CallBatch, CustomerCall, CallStatus, CallOutcome, BatchStatus
from app.schemas.customer_call import (
    CustomerCallCreate, CustomerCallUpdate, CustomerCallResponse,
    CallBatchCreate, CallBatchResponse, ExtractionResponse
)
from app.core.deps import get_current_admin
from pydantic import BaseModel

class VoiceLogPayload(BaseModel):
    caller_number: str
    summary: str
    timestamp: str

from app.services.customer_image_service import customer_image_service
from app.services.call_processor import process_batch_background

router = APIRouter(prefix="/admin/customer-calls", tags=["Customer Calls"])

UPLOAD_DIR = "uploads/customer_images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

import requests
import logging

logger = logging.getLogger("bowls-n-jars.customer_calls")


def _wait_for_agent_ready(
    agent_base_url: str,
    poll_interval_s: float = 2.0,
    timeout_s: float = 60.0,
) -> bool:
    """
    Poll the voice agent's /health endpoint until it reports ready=true.

    Returns True when the agent is ready, False if timeout_s is exceeded.
    This is intentionally synchronous (called from background threads and
    from the synchronous wake_up_servers endpoint).
    """
    health_url = f"{agent_base_url.rstrip('/')}/health"
    deadline = time.monotonic() + timeout_s
    attempt = 0
    while time.monotonic() < deadline:
        attempt += 1
        try:
            resp = requests.get(health_url, timeout=5)
            data = resp.json()
            if resp.status_code == 200 and data.get("ready") is True:
                logger.info(
                    f"[WAKE-UP] Voice agent is READY after {attempt} poll(s) "
                    f"— {health_url}"
                )
                return True
            logger.info(
                f"[WAKE-UP] Poll #{attempt}: agent not ready yet "
                f"(status={resp.status_code}, body={data}). Retrying in {poll_interval_s}s..."
            )
        except Exception as exc:
            logger.info(
                f"[WAKE-UP] Poll #{attempt}: request failed ({exc}). Retrying in {poll_interval_s}s..."
            )
        time.sleep(poll_interval_s)

    logger.error(
        f"[WAKE-UP] Voice agent did NOT become ready within {timeout_s}s. Giving up."
    )
    return False


@router.get("/wake-up")
def wake_up_servers(admin: User = Depends(get_current_admin)):
    """
    Wakes up the voice agent and WAITS (polls) until it reports healthy.
    Returns 200 when ready, 503 if it times out.
    Must be called and awaited by the frontend before starting any batch.
    """
    agent_base_url = os.getenv("VOICE_AGENT_BASE_URL", "")

    # Local/mock mode: backend is already awake, no agent to ping.
    if (
        not agent_base_url
        or agent_base_url == "https://your-agent.onrender.com"
        or os.getenv("USE_MOCK_AGENT", "true").lower() == "true"
    ):
        logger.info("[WAKE-UP] Mock/local mode — skipping voice agent poll.")
        return {"status": "success", "message": "Backend is awake (Mock/Local mode active)"}

    logger.info(f"[WAKE-UP] Polling voice agent at {agent_base_url} until ready...")
    ready = _wait_for_agent_ready(agent_base_url, poll_interval_s=2.0, timeout_s=60.0)

    if not ready:
        raise HTTPException(
            status_code=503,
            detail=(
                "Voice agent did not become ready within 60 seconds. "
                "Please retry after a moment — the service may still be cold-starting."
            ),
        )

    return {"status": "success", "message": "Both backend and Voice Agent servers are READY!"}

@router.post("/upload", response_model=ExtractionResponse)
async def upload_and_extract_images(
    files: List[UploadFile] = File(...),
    admin: User = Depends(get_current_admin)
):
    if len(files) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 images allowed per batch.")
    
    extracted_customers = []
    
    for file in files:
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG/PNG allowed.")
            
        file_content = await file.read()
        if len(file_content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File {file.filename} is too large. Maximum size is 5MB.")
            
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
            
        # Call extraction service
        try:
            results = customer_image_service.extract(file_path, file.filename)
            for res in results:
                extracted_customers.append(
                    CustomerCallCreate(
                        customer_name=res.get("name", "Unknown"),
                        phone_number=res.get("phone_number", "Unknown"),
                        source_image=file.filename,
                        extraction_status=res.get("extraction_status", "Success")
                    )
                )
        except Exception as e:
            # Clean backend failure
            raise HTTPException(
                status_code=500, 
                detail=f"OCR Service failed for {file.filename}. Reason: {str(e)}"
            )

    return {"customers": extracted_customers}

@router.get("/batches", response_model=List[CallBatchResponse])
def get_batches(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    batches = db.query(CallBatch).order_by(CallBatch.created_at.desc()).all()
    return batches

@router.post("/batches", response_model=CallBatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(
    batch_in: CallBatchCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if not batch_in.customers:
        raise HTTPException(status_code=400, detail="No customers provided.")
        
    today = date.today()
    base_name = f"Customer Calls - {today.strftime('%Y-%m-%d')}"
    
    # Check existing batches today
    existing_count = db.query(CallBatch).filter(
        func.date(CallBatch.batch_date) == today
    ).count()
    
    batch_name = f"{base_name} - Batch {existing_count + 1}" if existing_count > 0 else base_name

    new_batch = CallBatch(
        batch_name=batch_name,
        batch_date=datetime.utcnow(),
        total_customers=len(batch_in.customers),
        status=BatchStatus.PENDING,
        agent_prompt=batch_in.agent_prompt
    )
    db.add(new_batch)
    db.commit()
    db.refresh(new_batch)
    
    for cust in batch_in.customers:
        db_call = CustomerCall(
            batch_id=new_batch.id,
            customer_name=cust.customer_name,
            phone_number=cust.phone_number,
            source_image=cust.source_image,
            call_status=CallStatus.PENDING,
            call_outcome=CallOutcome.PENDING
        )
        db.add(db_call)
        
    db.commit()
    db.refresh(new_batch)
    return new_batch

@router.get("/batches/{batch_id}", response_model=CallBatchResponse)
def get_batch(
    batch_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch

@router.post("/batches/{batch_id}/start")
def start_batch(
    batch_id: int,
    background_tasks: BackgroundTasks,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    if batch.status in [BatchStatus.IN_PROGRESS, BatchStatus.COMPLETED]:
        raise HTTPException(status_code=400, detail="Calls are already in progress or completed.")
        
    batch.status = BatchStatus.IN_PROGRESS
    
    # Set all pending to queued
    for call in batch.calls:
        if call.call_status == CallStatus.PENDING:
            call.call_status = CallStatus.QUEUED
            
    db.commit()
    
    # Start the actual future voice agent integration workflow
    background_tasks.add_task(process_batch_background, batch_id)
    
    return {"message": "Batch processing started."}

@router.post("/batches/{batch_id}/cancel")
def cancel_batch(
    batch_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    batch.status = BatchStatus.FAILED
    for call in batch.calls:
        if call.call_status in [CallStatus.PENDING, CallStatus.QUEUED, CallStatus.CALLING]:
            call.call_status = CallStatus.CANCELLED
            call.agent_notes = "Cancelled by admin"
            call.call_outcome = CallOutcome.PENDING
            call.call_end_time = datetime.utcnow()
    
    db.commit()
    return {"message": "Batch cancelled"}

@router.post("/batches/{batch_id}/google-sheet")
def generate_google_sheet(
    batch_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    from app.services.google_sheets_service import google_sheets_service
    
    batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    try:
        # Create Google Sheet format
        # Use batch_name for the tab name
        # PostgreSQL is source of truth, so query calls from DB
        calls = db.query(CustomerCall).filter(CustomerCall.batch_id == batch_id).all()
        
        result = google_sheets_service.generate_batch_report(
            batch_name=batch.batch_name,
            batch_date=batch.batch_date,
            calls=calls
        )
        
        # Save to PostgreSQL
        batch.google_sheet_id = result["google_sheet_id"]
        batch.google_sheet_url = result["google_sheet_url"]
        batch.google_sheet_tab_name = result["google_sheet_tab_name"]
        batch.google_sheet_tab_id = result["google_sheet_tab_id"]
        db.commit()
        
        return {
            "message": "Google Sheet generated successfully",
            "google_sheet_url": result["google_sheet_url"],
            "google_sheet_tab_name": result["google_sheet_tab_name"]
        }
    except Exception as e:
        # Log error safely and return 500 without crashing data
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/batches/{batch_id}/google-sheet")
def get_google_sheet(
    batch_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
        
    if not batch.google_sheet_url:
        raise HTTPException(status_code=404, detail="Google Sheet not generated yet for this batch.")
        
    return {
        "google_sheet_id": batch.google_sheet_id,
        "google_sheet_url": batch.google_sheet_url,
        "google_sheet_tab_name": batch.google_sheet_tab_name,
        "google_sheet_tab_id": batch.google_sheet_tab_id
    }

@router.get("/summary")
def get_call_summary(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    today = date.today()
    calls_today = db.query(CustomerCall).join(CallBatch).filter(
        func.date(CallBatch.batch_date) == today
    ).all()
    
    total = len(calls_today)
    completed = sum(1 for c in calls_today if c.call_status == CallStatus.COMPLETED)
    pending = sum(1 for c in calls_today if c.call_status in [CallStatus.PENDING, CallStatus.QUEUED])
    failed = sum(1 for c in calls_today if c.call_status == CallStatus.FAILED)
    no_answer = sum(1 for c in calls_today if c.call_status == CallStatus.NO_ANSWER)
    interested = sum(1 for c in calls_today if c.call_outcome == CallOutcome.INTERESTED)
    follow_ups = sum(1 for c in calls_today if c.follow_up_required)
    
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "failed": failed,
        "no_answer": no_answer,
        "interested": interested,
        "follow_ups": follow_ups
    }

@router.post("/voice-logs")
def receive_voice_logs(payload: VoiceLogPayload, db: Session = Depends(get_db)):
    # In a real scenario, match by call_id or phone_number. For now we just find the latest.
    call = db.query(CustomerCall).filter(
        CustomerCall.phone_number == payload.caller_number
    ).order_by(CustomerCall.id.desc()).first()
    
    if call:
        call.transcript = payload.summary
        call.call_status = CallStatus.COMPLETED
        try:
            call.call_end_time = datetime.fromisoformat(payload.timestamp)
        except ValueError:
            pass
        db.commit()
    
    return {"status": "saved"}
