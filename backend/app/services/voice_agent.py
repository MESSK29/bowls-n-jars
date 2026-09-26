import time
import random
from datetime import datetime, timezone
from typing import Dict, Any, Tuple
from abc import ABC, abstractmethod
import os
import requests
import urllib.parse

class VoiceCallAgent(ABC):
    """
    Abstract interface for connecting to a Voice Call Agent provider (e.g., Twilio, Bland AI, Retell, etc.)
    """
    
    @abstractmethod
    def start_call(self, customer_name: str, phone_number: str, agent_prompt: str = None) -> str:
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
    
    def __init__(self):
        self.call_prompts = {}

    def start_call(self, customer_name: str, phone_number: str, agent_prompt: str = None) -> str:
        # Simulate API latency
        time.sleep(1)
        call_id = f"mock_call_{random.randint(10000, 99999)}_{int(time.time())}"
        self.call_prompts[call_id] = agent_prompt
        return call_id
        
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
        prompt = self.call_prompts.get(call_id)
        intro = f"Agent (in Telugu): Namaskaram, idi Bowls 'N' Jars nundi. {prompt if prompt else 'Meeku elanti sahayam kavali?'}\n"
        return intro + "Customer: Namaskaram! Chala bagundi, nenu chustanu.\nAgent: Tarwata emaina queries unte adagandi. [MOCK TRANSCRIPT]"
        
    def get_recording(self, call_id: str) -> str:
        return f"https://mock-provider.example.com/recordings/{call_id}.mp3"

class RealTwilioVoiceAgent(VoiceCallAgent):
    def start_call(self, customer_name: str, phone_number: str, agent_prompt: str = None) -> str:
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        twilio_number = os.getenv("TWILIO_PHONE_NUMBER")
        agent_base_url = os.getenv("VOICE_AGENT_BASE_URL", "https://your-agent.onrender.com")

        if not account_sid or not auth_token:
            print("Missing Twilio credentials in environment.")
            raise Exception("Twilio credentials missing. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.")
            
        call_url = f"{agent_base_url}/voice?name={urllib.parse.quote(customer_name)}&details={urllib.parse.quote(agent_prompt or '')}&phone={urllib.parse.quote(phone_number)}"
        
        try:
            response = requests.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Calls.json",
                auth=(account_sid, auth_token),
                data={
                    "To": phone_number,
                    "From": twilio_number,
                    "Url": call_url
                },
                timeout=10
            )
            response_data = response.json()
            print(f"Twilio API Response: {response_data}")
            if response.status_code >= 400:
                raise Exception(f"Twilio API Error: {response_data.get('message', 'Unknown Error')}")
            return response_data.get("sid", "unknown_sid")
        except Exception as e:
            print(f"Twilio API Error: {e}")
            raise e
            
    def get_call_status(self, call_id: str) -> str:
        return "Calling"
        
    def get_call_result(self, call_id: str) -> Dict[str, Any]:
        return {}
        
    def get_transcript(self, call_id: str) -> str:
        return ""
        
    def get_recording(self, call_id: str) -> str:
        return ""

# Export the active agent
use_mock = os.getenv("USE_MOCK_AGENT", "true").lower() == "true"
voice_agent = MockVoiceCallAgent() if use_mock else RealTwilioVoiceAgent()
