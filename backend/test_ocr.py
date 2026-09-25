import re
text = """Likith 9966593293
Abhi 9966593494
Sam 9154443842
Neelu 9440211769"""

# We want to extract phone and name.
lines = [line.strip() for line in text.split('\n') if line.strip()]
customers = []

phone_regex = r'(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{2}[\s-]?\d{3}[\s-]?\d{4}'

for line in lines:
    phone_match = re.search(phone_regex, line)
    if phone_match:
        phone = re.sub(r'[\s\-\+]', '', phone_match.group(0))[-10:]
        # Remove phone from line to get name
        name = line.replace(phone_match.group(0), '').strip()
        # Clean up any random special characters left over
        name = re.sub(r'[^\w\s]', '', name).strip()
        
        if len(name) >= 2:
            customers.append({"name": name, "phone": phone})
        else:
            customers.append({"name": "", "phone": phone})
            
print(customers)
