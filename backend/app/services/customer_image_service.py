import os
import re
import logging
try:
    import pytesseract
    from PIL import Image
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

logger = logging.getLogger(__name__)

class CustomerImageService:
    @staticmethod
    def extract(file_path: str, filename: str) -> list[dict]:
        """
        Extracts customer information from an uploaded image using Tesseract OCR.
        """
        if not TESSERACT_AVAILABLE:
            raise Exception("Tesseract OCR (pytesseract/Pillow) is not installed.")

        try:
            # Configure pytesseract path if needed on Windows (e.g., C:\\Program Files\\Tesseract-OCR\\tesseract.exe)
            # but usually it relies on the system PATH.
            image = Image.open(file_path)
            extracted_text = pytesseract.image_to_string(image)
            logger.info(f"Extracted text from {filename}: {extracted_text}")
        except Exception as e:
            logger.error(f"OCR Error on {filename}: {e}")
            raise Exception(f"OCR failed to process the image. Error: {str(e)}")
            
        # Parse text for Name and Phone
        phone_regex = r'(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}'
        lines = [line.strip() for line in extracted_text.split('\n') if line.strip()]
        
        customers = []
        unmatched_phones = []
        unmatched_names = []
        
        # First pass: try to find phone numbers on each line
        for line in lines:
            phone_matches = re.findall(phone_regex, line)
            
            if phone_matches:
                # Process the first phone number found on the line
                raw_phone = phone_matches[0]
                phone = re.sub(r'[\s\-\+]', '', raw_phone)[-10:]
                
                # Check if there is a name on the same line
                name_part = line.replace(raw_phone, '').strip()
                name_part = re.sub(r'[^\w\s]', '', name_part).strip() # clean punctuation
                
                # If a valid name is on the same line
                if len(name_part) >= 2 and not any(c.isdigit() for c in name_part):
                    customers.append({
                        "name": name_part,
                        "phone_number": phone,
                        "extraction_status": "Success"
                    })
                else:
                    unmatched_phones.append(phone)
            else:
                # Potential name line (no phone number found here)
                clean_name = re.sub(r'[^\w\s]', '', line).strip()
                # Must be at least 2 characters (e.g. "Om", "Bo") and contain no digits
                if len(clean_name) >= 2 and not any(c.isdigit() for c in clean_name):
                    unmatched_names.append(clean_name)
                    
        # Second pass: pair up unmatched phones and names sequentially
        for phone in unmatched_phones:
            if unmatched_names:
                name = unmatched_names.pop(0)
                customers.append({
                    "name": name,
                    "phone_number": phone,
                    "extraction_status": "Success"
                })
            else:
                customers.append({
                    "name": "Could not identify customer name",
                    "phone_number": phone,
                    "extraction_status": "Partial"
                })
                
        # If there are leftover names with no phones
        for name in unmatched_names:
            customers.append({
                "name": name,
                "phone_number": "Could not identify phone number",
                "extraction_status": "Partial"
            })
            
        # Deduplicate by phone
        seen_phones = set()
        unique_customers = []
        for c in customers:
            if c["phone_number"] not in seen_phones or c["phone_number"] == "Could not identify phone number":
                unique_customers.append(c)
                if c["phone_number"] != "Could not identify phone number":
                    seen_phones.add(c["phone_number"])
                    
        return unique_customers

customer_image_service = CustomerImageService()
