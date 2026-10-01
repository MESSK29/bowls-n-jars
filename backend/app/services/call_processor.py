import traceback
import os
from datetime import datetime, timezone
from app.database import SessionLocal
from app.models.customer_call import CallBatch, CustomerCall, CallStatus, BatchStatus, CallOutcome
from app.services.voice_agent import voice_agent, use_mock

def process_batch_background(batch_id: int):
    """
    Background worker that iterates through all queued calls in a batch,
    communicates with the voice agent interface, and updates the database.
    It catches exceptions on a per-call basis to prevent a single failure
    from breaking the entire batch loop.
    """
    db = SessionLocal()
    try:
        batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
        if not batch:
            return

        # -----------------------------------------------------------------
        # In real (non-mock) mode: verify the voice agent is ready BEFORE
        # placing any calls.  This is the primary guard against the
        # cold-start race condition.
        # -----------------------------------------------------------------
        if not use_mock:
            agent_base_url = os.getenv("VOICE_AGENT_BASE_URL", "")
            if agent_base_url and agent_base_url != "https://your-agent.onrender.com":
                from app.api.customer_calls import _wait_for_agent_ready
                import logging
                logger = logging.getLogger("bowls-n-jars.call_processor")
                logger.info(
                    f"[BATCH {batch_id}] Checking voice agent readiness before placing calls..."
                )
                ready = _wait_for_agent_ready(
                    agent_base_url, poll_interval_s=2.0, timeout_s=60.0
                )
                if not ready:
                    logger.error(
                        f"[BATCH {batch_id}] Voice agent not ready after 60s. "
                        "Marking batch FAILED."
                    )
                    batch.status = BatchStatus.FAILED
                    for call in batch.calls:
                        if call.call_status in [CallStatus.PENDING, CallStatus.QUEUED]:
                            call.call_status = CallStatus.FAILED
                            call.agent_notes = (
                                "System Error: Voice agent did not become ready in time "
                                "(cold-start timeout). Please retry."
                            )
                            call.call_end_time = datetime.now(timezone.utc)
                    db.commit()
                    return
                logger.info(f"[BATCH {batch_id}] Voice agent is READY. Proceeding with calls.")

        calls = db.query(CustomerCall).filter(
            CustomerCall.batch_id == batch_id,
            CustomerCall.call_status == CallStatus.QUEUED
        ).all()
        
        for call in calls:
            try:
                # 1. Start Call via Agent Interface
                call.call_status = CallStatus.CALLING
                call.call_start_time = datetime.now(timezone.utc)
                db.commit()
                
                # Mock Mode/Real Mode abstraction handles the delay
                call_id = voice_agent.start_call(call.customer_name, call.phone_number, batch.agent_prompt)
                
                # 2. In a real environment with a webhook, we would stop here and wait for webhook.
                from app.services.voice_agent import use_mock
                
                if use_mock:
                    # Since we don't have webhooks connected yet, we poll synchronously in this worker.
                    # The mock agent simulates this immediately.
                    result = voice_agent.get_call_result(call_id)
                    transcript = voice_agent.get_transcript(call_id)
                    recording_url = voice_agent.get_recording(call_id)
                    
                    # 3. Store results
                    call.call_status = result.get("status", CallStatus.COMPLETED)
                    call.call_outcome = result.get("outcome")
                    call.call_duration = result.get("duration")
                    call.customer_response = result.get("customer_response")
                    call.customer_interest = result.get("customer_interest")
                    call.feedback = result.get("feedback")
                    call.follow_up_required = result.get("follow_up_required", False)
                    call.transcript = transcript
                    call.recording_url = recording_url
                    call.agent_notes = f"[Mock Mode] Handled via VoiceCallAgent ID: {call_id}"
                    call.call_end_time = datetime.now(timezone.utc)
                    
                    if call.call_status == CallStatus.COMPLETED:
                        batch.completed_calls += 1
                    else:
                        batch.failed_calls += 1
                else:
                    call.agent_notes = f"Real call initiated. Awaiting Webhook. SID: {call_id}"
                
                db.commit()
                
            except Exception as e:
                # Partial Failure protection
                print(f"Error processing call {call.id}: {str(e)}")
                traceback.print_exc()
                
                call.call_status = CallStatus.FAILED
                call.agent_notes = f"System Error: {str(e)}"
                call.call_end_time = datetime.now(timezone.utc)
                batch.failed_calls += 1
                db.commit()
                continue
                
        # Finalize batch ONLY if we are in Mock mode (because mock mode does them synchronously)
        # In real mode, we leave the batch In Progress so the user can watch the webhooks update the call statuses.
        from app.services.voice_agent import use_mock
        if use_mock:
            batch.status = BatchStatus.COMPLETED
        # If real mode, it stays IN_PROGRESS indefinitely until the user clicks "Force Cancel / End Batch" in the UI.
        
        db.commit()
        
    except Exception as e:
        print(f"Fatal error in batch {batch_id}: {str(e)}")
        batch = db.query(CallBatch).filter(CallBatch.id == batch_id).first()
        if batch:
            batch.status = BatchStatus.FAILED
            db.commit()
    finally:
        db.close()
