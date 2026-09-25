import os

class CustomerImageService:
    @staticmethod
    def extract(file_path: str, filename: str) -> list[dict]:
        """
        Extracts customer information from an uploaded image.
        In a real production environment, this would call Google Cloud Vision, AWS Textract, 
        or OpenAI Vision, and parse the resulting text to structure Name and Phone.
        
        For demonstration and testing, it uses deterministic logic based on the filename
        to simulate different extraction states (Success, Missing Phone, Missing Name, Duplicate).
        """
        
        # Simulate different scenarios based on filenames for testing
        lower_name = filename.lower()
        
        # Scenario: Missing Phone Number
        if "missing_phone" in lower_name:
            return [
                {
                    "name": "Jane Smith",
                    "phone_number": "Could not identify phone number",
                    "extraction_status": "Partial"
                }
            ]
            
        # Scenario: Missing Name
        if "missing_name" in lower_name:
            return [
                {
                    "name": "Could not identify customer name",
                    "phone_number": "9876543210",
                    "extraction_status": "Partial"
                }
            ]
            
        # Scenario: Multiple Customers in one image
        if "multiple" in lower_name:
            return [
                {
                    "name": "Alice Johnson",
                    "phone_number": "9998887776",
                    "extraction_status": "Success"
                },
                {
                    "name": "Bob Williams",
                    "phone_number": "9998887777",
                    "extraction_status": "Success"
                }
            ]
            
        # Scenario: Extraction Failure (Unreadable image)
        if "fail" in lower_name or "error" in lower_name:
            raise Exception("OCR failed to process the image: Image is too blurry or unreadable.")
            
        # Scenario: Duplicate (Simulate returning a phone number that is often used)
        if "duplicate" in lower_name:
            return [
                {
                    "name": "Duplicate User",
                    "phone_number": "9999999999",
                    "extraction_status": "Success"
                },
                {
                    "name": "Duplicate User Copy",
                    "phone_number": "9999999999",
                    "extraction_status": "Success"
                }
            ]
            
        # Default Success Scenario
        # Fallback to standard successful extraction
        return [
            {
                "name": f"Customer from {filename.split('.')[0][:10]}",
                "phone_number": "9876543210",
                "extraction_status": "Success"
            }
        ]

customer_image_service = CustomerImageService()
