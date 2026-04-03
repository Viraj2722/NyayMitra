def detect_urgency(text):
    keywords = ["violence", "threat", "unsafe", "maar", "danger", "khatra", "bachao", "mar", "kill", "suicide"]

    for word in keywords:
        if word in text.lower():
            return True
    return False
