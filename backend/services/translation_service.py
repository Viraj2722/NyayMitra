from googletrans import Translator

translator = Translator()

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
