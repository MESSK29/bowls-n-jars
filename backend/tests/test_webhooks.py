from app.api.webhooks import twilio_status_webhook
from app.models.customer_call import CallStatus

def test_webhook_status_mapping():
    # We want to ensure that all expected Twilio statuses map to a valid CallStatus enum
    # without throwing an AttributeError.
    
    expected_twilio_statuses = [
        "queued", "initiated", "ringing", "in-progress", 
        "completed", "busy", "failed", "no-answer", "canceled"
    ]
    
    from app.models.customer_call import CallOutcome
    print("CallStatus members:", list(CallStatus))
    print("CallOutcome members:", list(CallOutcome))

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
        "completed": CallOutcome.PENDING,
        "busy": CallOutcome.NO_RESPONSE,
        "failed": CallOutcome.OTHER,
        "no-answer": CallOutcome.NO_RESPONSE,
        "canceled": CallOutcome.NO_RESPONSE
    }
    
    # Assert all keys are valid enums
    for twilio_status in expected_twilio_statuses:
        mapped_status = status_mapping.get(twilio_status)
        assert mapped_status is not None, f"Twilio status '{twilio_status}' is missing from status_mapping"
        assert isinstance(mapped_status, CallStatus), f"Mapped value for '{twilio_status}' is not a CallStatus enum"

        if twilio_status in outcome_mapping:
            mapped_outcome = outcome_mapping[twilio_status]
            assert isinstance(mapped_outcome, CallOutcome), f"Mapped value for '{twilio_status}' is not a CallOutcome enum"
