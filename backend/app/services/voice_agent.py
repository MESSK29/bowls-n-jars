import time
import random
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from abc import ABC, abstractmethod

class VoiceCallAgent(ABC):
    """
    Abstract interface for connecting to a Voice Call Agent provider (e.g., Twilio, Bland AI, Retell, etc.)
    """
    
    @abstractmethod
    def start_call(self, customer_name: str, phone_number: str) -> str:
        """Starts a call and returns a provider-specific Call ID"""
        pass
        
    @abstractmethod
    def get_call_status(self, call_id: str) -> str:
        """Returns the current status of the call from the provider"""
        pass
        
    @abstractmethod
    def get_call_result(self, call_id: str) -> Dict[str, Any]:
        """Returns the finalized call result, outcome, duration, and metadata"""
        pass
        
    @abstractmethod
    def get_transcript(self, call_id: str) -> str:
        """Returns the full transcript of the conversation"""
        pass
        
    @abstractmethod
    def get_recording(self, call_id: str) -> str:
        """Returns a URL to the call recording"""
        pass


class MockVoiceCallAgent(VoiceCallAgent):
    """
    Mock implementation for development and testing. 
    It intentionally introduces delays and random outcomes to simulate a real calling environment.
    """
    
    def start_call(self, customer_name: str, phone_number: str) -> str:
        # Simulate API latency
        time.sleep(1)
        return f"mock_call_{random.randint(10000, 99999)}_{int(time.time())}"
        
    def get_call_status(self, call_id: str) -> str:
        return "Completed"
        
    def get_call_result(self, call_id: str) -> Dict[str, Any]:
        # Simulate call duration
        time.sleep(2)
        
        # Simulate different real-world outcomes
        outcomes = [
            "Interested", 
            "Not Interested", 
            "Follow-up Required", 
            "Requested More Information",
            "No Response",
            "Busy"
        ]
        
        outcome = random.choice(outcomes)
        
        # Map provider outcome to system status
        if outcome in ["No Response"]:
            status = "No Answer"
        elif outcome in ["Busy"]:
            status = "Busy"
        else:
            status = "Completed"
            
        duration_seconds = random.randint(30, 300)
        minutes = duration_seconds // 60
        seconds = duration_seconds % 60
        
        return {
            "status": status,
            "outcome": outcome,
            "duration": f"{minutes:02d}:{seconds:02d}",
            "customer_response": "The customer sounded engaged." if status == "Completed" else None,
            "customer_interest": "High" if outcome == "Interested" else ("Low" if outcome == "Not Interested" else "Medium"),
            "feedback": "Agent mock feedback: Good call overall.",
            "follow_up_required": outcome == "Follow-up Required",
        }
        
    def get_transcript(self, call_id: str) -> str:
        return "Agent: Hello, this is Bowls 'N' Jars.\nCustomer: Hi, I was looking at your ceramics.\nAgent: Great, let me help you with that. [MOCK TRANSCRIPT]"
        
    def get_recording(self, call_id: str) -> str:
        return f"https://mock-provider.example.com/recordings/{call_id}.mp3"

# Export the active agent (can be swapped via Env vars later)
voice_agent = MockVoiceCallAgent()
