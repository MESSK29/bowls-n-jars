import os
from fastapi import APIRouter, Request, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.customer_call import CustomerCall, CallBatch, CallStatus, CallOutcome, BatchStatus
from twilio.request_validator import RequestValidator

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/twilio-status")
async def twilio_status_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Receives call status updates from Twilio.
    """
    # 1. Validate the Twilio signature
    validator = RequestValidator(os.getenv("TWILIO_AUTH_TOKEN", ""))
    signature = request.headers.get("X-Twilio-Signature", "")
    url = str(request.url)
    
    # Twilio sends application/x-www-form-urlencoded
    form_data = await request.form()
    post_vars = dict(form_data)
    
    # If the token is set, we validate. If it's empty (e.g. testing), we skip for now.
    if os.getenv("TWILIO_AUTH_TOKEN") and not validator.validate(url, post_vars, signature):
        raise HTTPException(status_code=403, detail="Invalid Twilio signature")

    call_sid = post_vars.get("CallSid")
    call_status = post_vars.get("CallStatus")
    
    if not call_sid or not call_status:
        return {"status": "ignored"}
        
    # 2. Look up the call in the database
    # The 'recording_url' is currently used to store the Call SID in process_batch_background
    call = db.query(CustomerCall).filter(CustomerCall.recording_url == call_sid).first()
    if not call:
        # If we can't find it by recording_url (SID), maybe the call hasn't been saved yet or SID is elsewhere
        # We will also check agent_notes just in case
        call = db.query(CustomerCall).filter(CustomerCall.agent_notes.like(f"%{call_sid}%")).first()
        
    if not call:
        print(f"Webhook error: Could not find call with SID {call_sid}")
        return {"status": "not found"}

    # 3. Update the call status
    # Twilio statuses: queued, initiated, ringing, in-progress, completed, busy, failed, no-answer, canceled
    status_mapping = {
        "queued": CallStatus.QUEUED,
        "initiated": CallStatus.CALLING,
        "ringing": CallStatus.CALLING,
        "in-progress": CallStatus.CALLING,
        "completed": CallStatus.COMPLETED,
        "busy": CallStatus.BUSY,
        "failed": CallStatus.FAILED,
        "no-answer": CallStatus.NO_ANSWER,
        "canceled": CallStatus.CANCELLED
    }
    
    outcome_mapping = {
        "completed": CallOutcome.INTERESTED, # Or pending, assuming it connected
        "busy": CallOutcome.NO_RESPONSE,
        "failed": CallOutcome.INVALID_NUMBER,
        "no-answer": CallOutcome.NO_RESPONSE,
        "canceled": CallOutcome.NO_RESPONSE
    }

    if call_status in status_mapping:
        call.call_status = status_mapping[call_status]
        
    if call_status in outcome_mapping and call.call_outcome == CallOutcome.PENDING:
        call.call_outcome = outcome_mapping[call_status]
        
    # Append the raw status to notes for debugging
    call.agent_notes = f"{call.agent_notes or ''}\nTwilio Status Update: {call_status}".strip()
    
    db.commit()
    
    # 4. Check if the batch is complete
    if call.batch_id and call_status in ["completed", "busy", "failed", "no-answer", "canceled"]:
        background_tasks.add_task(check_and_complete_batch, call.batch_id)
        
    return {"status": "success"}

def check_and_complete_batch(batch_id: int):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
        if not batch:
            return
            
        # Check if there are any calls still pending, queued, or calling
        active_calls = db.query(CustomerCall).filter(
            CustomerCall.batch_id == batch_id,
            CustomerCall.call_status.in_([CallStatus.PENDING, CallStatus.QUEUED, CallStatus.CALLING])
        ).count()
        
        if active_calls == 0 and batch.status == BatchStatus.IN_PROGRESS:
            batch.status = BatchStatus.COMPLETED
            db.commit()
            print(f"Batch {batch_id} automatically marked as COMPLETED by webhook.")
    finally:
        db.close()
