from googletrans import Translator

translator = Translator()

LANGUAGE_TO_CODE = {
    "English": "en",
    "Hindi": "hi",
    "Marathi": "mr",
    "Bengali": "bn",
    "Gujarati": "gu",
    "Tamil": "ta",
    "Telugu": "te",
    "Kannada": "kn",
    "Malayalam": "ml",
    "Punjabi": "pa",
    "Urdu": "ur",
}

def detect_language(text):
    try:
        return translator.detect(text).lang
    except Exception:
        return "en" # Fallback to English

def translate_to_english(text):
    try:
        return translator.translate(text, dest="en").text
    except Exception:
        return text # Fallback to original text

def translate_text(text, target_language):
    try:
        code = LANGUAGE_TO_CODE.get(target_language, "en")
        return translator.translate(text, dest=code).text
    except Exception:
        return text
