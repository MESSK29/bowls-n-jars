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
        # Phone: looking for 10 digits (ignoring spaces/dashes)
        phone_matches = re.findall(r'(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}', extracted_text)
        
        # We will try to find potential names (lines of text that don't look like purely numbers)
        lines = [line.strip() for line in extracted_text.split('\n') if line.strip()]
        
        customers = []
        
        if phone_matches:
            # Clean up phones
            phones = list(set([re.sub(r'[\s\-\+]', '', p)[-10:] for p in phone_matches]))
            
            for i, phone in enumerate(phones):
                # Try to guess a name from the lines (this is very basic heuristic)
                guessed_name = ""
                for line in lines:
                    if len(line) > 3 and not any(char.isdigit() for char in line):
                        guessed_name = line
                        # Remove it so we don't reuse it
                        lines.remove(line)
                        break
                
                customers.append({
                    "name": guessed_name if guessed_name else "Could not identify customer name",
                    "phone_number": phone,
                    "extraction_status": "Success" if guessed_name else "Partial"
                })
        else:
            # Missing phone
            guessed_name = ""
            if lines:
                for line in lines:
                    if len(line) > 3 and not any(char.isdigit() for char in line):
                        guessed_name = line
                        break
            
            customers.append({
                "name": guessed_name if guessed_name else "Unknown Customer",
                "phone_number": "Could not identify phone number",
                "extraction_status": "Partial"
            })
            
        return customers

customer_image_service = CustomerImageService()
