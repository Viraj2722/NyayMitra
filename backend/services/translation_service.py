try:
    from googletrans import Translator
    translator = Translator()
except Exception as import_error:
    translator = None
    print("Translation service running in fallback mode:", import_error)

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
    if translator is None:
        return "en"
    try:
        return translator.detect(text).lang
    except Exception:
        return "en" # Fallback to English

def translate_to_english(text):
    if translator is None:
        return text
    try:
        return translator.translate(text, dest="en").text
    except Exception:
        return text # Fallback to original text

def translate_text(text, target_language):
    if translator is None:
        return text
    try:
        code = LANGUAGE_TO_CODE.get(target_language, "en")
        return translator.translate(text, dest=code).text
    except Exception:
        return text
