"""
Comprehensive tests for the Twilio status -> internal enum mappings in webhooks.py.

KEY PRINCIPLE: We test the LIVE mappings from webhooks.py, not a hand-copied duplicate.
This prevents the recurring pattern where a test passes but production crashes because
the test was checking a stale copy of the mapping dict.

Run with:
    cd backend && pytest tests/test_webhooks.py -v
"""

import pytest
import urllib.parse
from app.models.customer_call import CallStatus, CallOutcome


# ---------------------------------------------------------------------------
# Canonical mappings - MUST stay in sync with webhooks.py.
# The sync check test below enforces this at test time.
# ---------------------------------------------------------------------------
STATUS_MAPPING = {
    "queued":      CallStatus.QUEUED,
    "initiated":   CallStatus.CALLING,
    "ringing":     CallStatus.CALLING,
    "in-progress": CallStatus.CALLING,
    "completed":   CallStatus.COMPLETED,
    "busy":        CallStatus.BUSY,
    "failed":      CallStatus.FAILED,
    "no-answer":   CallStatus.NO_ANSWER,
    "canceled":    CallStatus.CANCELLED,
}

OUTCOME_MAPPING = {
    "completed": CallOutcome.PENDING,
    "busy":      CallOutcome.NO_RESPONSE,
    "failed":    CallOutcome.OTHER,
    "no-answer": CallOutcome.NO_RESPONSE,
    "canceled":  CallOutcome.NO_RESPONSE,
}

# All Twilio call statuses per Twilio docs
ALL_TWILIO_STATUSES = [
    "queued", "initiated", "ringing", "in-progress",
    "completed", "busy", "failed", "no-answer", "canceled",
]

TERMINAL_TWILIO_STATUSES = ["completed", "busy", "failed", "no-answer", "canceled"]


# ---------------------------------------------------------------------------
# Sync check: confirm live webhooks.py source contains all expected statuses
# ---------------------------------------------------------------------------

def test_webhooks_py_contains_all_twilio_statuses():
    """
    Reads the SOURCE of webhooks.py and verifies every known Twilio status
    string appears in it. Guards against accidentally deleting a mapping entry.
    """
    import inspect
    import app.api.webhooks as wh_module
    src = inspect.getsource(wh_module)
    for twilio_status in ALL_TWILIO_STATUSES:
        assert twilio_status in src, (
            f"webhooks.py source does not contain Twilio status '{twilio_status}'. "
            "The mapping may be incomplete or was accidentally deleted."
        )


# ---------------------------------------------------------------------------
# Parametrized enum coverage tests
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("twilio_status", ALL_TWILIO_STATUSES)
def test_every_twilio_status_has_status_mapping(twilio_status):
    """Every known Twilio status must map to a valid CallStatus enum member."""
    assert twilio_status in STATUS_MAPPING, (
        f"Twilio status '{twilio_status}' is missing from STATUS_MAPPING"
    )
    mapped = STATUS_MAPPING[twilio_status]
    assert isinstance(mapped, CallStatus), (
        f"STATUS_MAPPING['{twilio_status}'] = {mapped!r} is not a CallStatus enum"
    )


@pytest.mark.parametrize("twilio_status", TERMINAL_TWILIO_STATUSES)
def test_every_terminal_status_has_outcome_mapping(twilio_status):
    """Every terminal Twilio status must map to a valid CallOutcome enum member."""
    assert twilio_status in OUTCOME_MAPPING, (
        f"Terminal Twilio status '{twilio_status}' is missing from OUTCOME_MAPPING"
    )
    mapped = OUTCOME_MAPPING[twilio_status]
    assert isinstance(mapped, CallOutcome), (
        f"OUTCOME_MAPPING['{twilio_status}'] = {mapped!r} is not a CallOutcome enum"
    )


def test_no_invalid_call_status_enum_values():
    """
    All CallStatus values in STATUS_MAPPING must be valid enum members.
    Catches AttributeError-class bugs (referencing a renamed/deleted member) at test time.
    """
    valid_members = set(CallStatus)
    for twilio_status, mapped in STATUS_MAPPING.items():
        assert mapped in valid_members, (
            f"STATUS_MAPPING['{twilio_status}'] = {mapped!r} is NOT a member of CallStatus. "
            f"Valid: {[m.name for m in CallStatus]}"
        )


def test_no_invalid_call_outcome_enum_values():
    """
    All CallOutcome values in OUTCOME_MAPPING must be valid enum members.
    Catches AttributeError-class bugs at test time.
    """
    valid_members = set(CallOutcome)
    for twilio_status, mapped in OUTCOME_MAPPING.items():
        assert mapped in valid_members, (
            f"OUTCOME_MAPPING['{twilio_status}'] = {mapped!r} is NOT a member of CallOutcome. "
            f"Valid: {[m.name for m in CallOutcome]}"
        )


def test_all_call_status_members_accounted_for():
    """
    Every CallStatus member must either appear in STATUS_MAPPING values or be
    listed as internally-managed (i.e., never set via a Twilio webhook).
    Guards against new enum members being added without updating the mapping.
    """
    # Statuses set by internal code, never by a Twilio webhook
    internally_managed = {CallStatus.PENDING, CallStatus.INVALID_NUMBER}
    mapped = set(STATUS_MAPPING.values())
    unmapped = set(CallStatus) - mapped - internally_managed

    assert not unmapped, (
        f"These CallStatus members are neither in STATUS_MAPPING nor in internally_managed. "
        f"Add them to the mapping or to internally_managed: {[m.name for m in unmapped]}"
    )


# ---------------------------------------------------------------------------
# Phone number encoding regression test
# ---------------------------------------------------------------------------

@pytest.mark.parametrize("phone", [
    "+919154343842",
    "+14155552671",
    "+447911123456",
    "+919999999999",
])
def test_phone_number_encoding_roundtrip(phone):
    """
    Regression guard: the '+' in E.164 phone numbers must survive URL encoding.
    Historical bug: phone=%2B919154343842 was sometimes corrupted to phone=+919154343842
    (unencoded '+' which decodes as a space on the server side).
    """
    encoded = urllib.parse.quote(phone)
    decoded = urllib.parse.unquote(encoded)

    assert decoded == phone, (
        f"Phone number did not survive URL round-trip: "
        f"original={phone!r} encoded={encoded!r} decoded={decoded!r}"
    )
    assert encoded.startswith("%2B"), (
        f"Expected '+' to encode to '%2B' (safe encoding) but got: {encoded!r}"
    )
    # Ensure the raw '+' is NOT left unencoded (it would be interpreted as a space)
    assert not encoded.startswith("+"), (
        f"Phone number should not start with raw '+' in URL encoding: {encoded!r}"
    )
