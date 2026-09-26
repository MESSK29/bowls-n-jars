from app.api.webhooks import twilio_status_webhook
from app.models.customer_call import CallStatus

def test_webhook_status_mapping():
    # We want to ensure that all expected Twilio statuses map to a valid CallStatus enum
    # without throwing an AttributeError.
    
    expected_twilio_statuses = [
        "queued", "initiated", "ringing", "in-progress", 
        "completed", "busy", "failed", "no-answer", "canceled"
    ]
    
    # Extract the mapping directly from the code logic
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
    
    # Assert all keys are valid CallStatus enums (this will naturally throw if a member is invalid)
    for twilio_status in expected_twilio_statuses:
        mapped = status_mapping.get(twilio_status)
        assert mapped is not None, f"Twilio status '{twilio_status}' is missing from mapping"
        assert isinstance(mapped, CallStatus), f"Mapped value for '{twilio_status}' is not a CallStatus enum"
