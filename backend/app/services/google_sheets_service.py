import os
import json
import requests
from typing import List, Dict, Any
from datetime import datetime

try:
    from google.oauth2.service_account import Credentials
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
    GOOGLE_API_AVAILABLE = True
except ImportError:
    GOOGLE_API_AVAILABLE = False

class GoogleSheetsService:
    def __init__(self):
        self.scopes = ['https://www.googleapis.com/auth/spreadsheets']
        self.spreadsheet_id = os.getenv("GOOGLE_SHEETS_SPREADSHEET_ID")
        
        # Load credentials from env var (JSON string) or file
        self.credentials_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_CREDENTIALS")
        self.credentials_file = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        
        # Alternative: Google Apps Script Web App URL
        self.apps_script_url = os.getenv("GOOGLE_APPS_SCRIPT_URL")

    def _get_credentials(self):
        if not GOOGLE_API_AVAILABLE:
            raise Exception("Google API Python client libraries are not installed.")
            
        if self.credentials_json:
            creds_dict = json.loads(self.credentials_json)
            return Credentials.from_service_account_info(creds_dict, scopes=self.scopes)
        elif self.credentials_file and os.path.exists(self.credentials_file):
            return Credentials.from_service_account_file(self.credentials_file, scopes=self.scopes)
        else:
            raise Exception("Google Sheets credentials are not configured on the server.")

    def _get_service(self):
        if not self.spreadsheet_id:
            raise Exception("GOOGLE_SHEETS_SPREADSHEET_ID environment variable is missing.")
            
        creds = self._get_credentials()
        return build('sheets', 'v4', credentials=creds)

    def generate_batch_report(self, batch_name: str, batch_date: datetime, calls: List[Any]) -> Dict[str, str]:
        """
        Creates or updates a worksheet for the given batch and populates it with call data.
        Returns the spreadsheet ID, URL, tab name, and tab ID.
        """
        
        # Format the data first
        headers = [
            "S.No", "Customer Name", "Phone Number", "Call Date", "Call Time", 
            "Call Duration", "Call Status", "Call Outcome", "Conversation", 
            "Customer Feedback", "Customer Interest", "Follow-up Required", 
            "Follow-up Date", "Agent Notes", "Recording", "Transcript"
        ]
        
        values = [headers]
        
        for idx, call in enumerate(calls, start=1):
            date_str = call.call_start_time.strftime("%Y-%m-%d") if call.call_start_time else ""
            time_str = call.call_start_time.strftime("%H:%M:%S") if call.call_start_time else ""
            follow_up_date_str = call.follow_up_date.strftime("%Y-%m-%d") if call.follow_up_date else ""
            
            row = [
                idx,
                call.customer_name or "",
                call.phone_number or "",
                date_str,
                time_str,
                call.call_duration or "",
                call.call_status or "",
                call.call_outcome or "",
                call.conversation or "",
                call.feedback or "",
                call.customer_interest or "",
                "Yes" if call.follow_up_required else "No",
                follow_up_date_str,
                call.agent_notes or "",
                call.recording_url or "",
                call.transcript or ""
            ]
            values.append(row)

        # ---------------------------------------------------------
        # OPTION 1: No-Billing Apps Script Alternative
        # ---------------------------------------------------------
        if self.apps_script_url:
            payload = {
                "worksheet_name": batch_name,
                "values": values
            }
            
            response = requests.post(self.apps_script_url, json=payload)
            
            if response.status_code != 200:
                raise Exception(f"Apps Script failed: {response.text}")
                
            data = response.json()
            if data.get("status") == "error":
                raise Exception(f"Apps Script error: {data.get('message')}")
                
            return {
                "google_sheet_id": self.spreadsheet_id or "unknown",
                "google_sheet_url": data.get("sheet_url", ""),
                "google_sheet_tab_name": batch_name,
                "google_sheet_tab_id": str(data.get("sheet_id", ""))
            }
            
        # ---------------------------------------------------------
        # OPTION 2: Standard Google Cloud Service Account
        # ---------------------------------------------------------
        service = self._get_service()
        worksheet_name = batch_name
        
        try:
            sheet_metadata = service.spreadsheets().get(spreadsheetId=self.spreadsheet_id).execute()
            sheets = sheet_metadata.get('sheets', '')
        except HttpError as e:
            raise Exception(f"Failed to access Master Spreadsheet. Ensure the service account has editor access. ({e})")
            
        existing_sheet = next((s for s in sheets if s.get("properties", {}).get("title") == worksheet_name), None)
        
        sheet_id = None
        
        if existing_sheet:
            sheet_id = existing_sheet.get("properties", {}).get("sheetId")
            service.spreadsheets().values().clear(
                spreadsheetId=self.spreadsheet_id,
                range=f"'{worksheet_name}'!A:Z"
            ).execute()
        else:
            body = {
                "requests": [{
                    "addSheet": {
                        "properties": {
                            "title": worksheet_name
                        }
                    }
                }]
            }
            response = service.spreadsheets().batchUpdate(spreadsheetId=self.spreadsheet_id, body=body).execute()
            sheet_id = response.get('replies')[0].get('addSheet').get('properties').get('sheetId')
            
        body = {"values": values}
        service.spreadsheets().values().update(
            spreadsheetId=self.spreadsheet_id,
            range=f"'{worksheet_name}'!A1",
            valueInputOption="RAW",
            body=body
        ).execute()
        
        format_requests = [
            {
                "repeatCell": {
                    "range": {
                        "sheetId": sheet_id,
                        "startRowIndex": 0,
                        "endRowIndex": 1
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "textFormat": {"bold": True}
                        }
                    },
                    "fields": "userEnteredFormat.textFormat.bold"
                }
            },
            {
                "updateSheetProperties": {
                    "properties": {
                        "sheetId": sheet_id,
                        "gridProperties": {
                            "frozenRowCount": 1
                        }
                    },
                    "fields": "gridProperties.frozenRowCount"
                }
            },
            {
                "repeatCell": {
                    "range": {
                        "sheetId": sheet_id,
                        "startColumnIndex": 8,
                        "endColumnIndex": 16
                    },
                    "cell": {
                        "userEnteredFormat": {
                            "wrapStrategy": "WRAP"
                        }
                    },
                    "fields": "userEnteredFormat.wrapStrategy"
                }
            }
        ]
        
        service.spreadsheets().batchUpdate(
            spreadsheetId=self.spreadsheet_id, 
            body={"requests": format_requests}
        ).execute()
        
        sheet_url = f"https://docs.google.com/spreadsheets/d/{self.spreadsheet_id}/edit#gid={sheet_id}"
        
        return {
            "google_sheet_id": self.spreadsheet_id,
            "google_sheet_url": sheet_url,
            "google_sheet_tab_name": worksheet_name,
            "google_sheet_tab_id": str(sheet_id)
        }

google_sheets_service = GoogleSheetsService()
