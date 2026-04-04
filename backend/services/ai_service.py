import os
import json
import re
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env')
load_dotenv(env_path)

import google.generativeai as genai
from services.translation_service import translate_text

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash")

JARGON_MAP = {
    "injunction": "court order to stop something",
    "plaintiff": "person who filed the complaint",
    "affidavit": "signed written statement",
    "cognizable offence": "crime police can arrest for without a warrant",
    "cognizable": "arrestable without warrant",
    "suo motu": "on the court's own initiative",
    "ex parte": "decided without hearing one side",
    "habeas corpus": "right to be produced before a court",
    "locus standi": "right to bring a case to court",
    "bail": "temporary release from custody",
    "stay order": "court order to pause something"
}


def remove_jargon(text):
    sanitized = text or ""
    for term, replacement in JARGON_MAP.items():
        pattern = re.compile(rf"\b{re.escape(term)}\b", re.IGNORECASE)
        sanitized = pattern.sub(replacement, sanitized)
    return sanitized


SYSTEM_PROMPT = """
You are NyayMitra, a compassionate legal aid assistant for low-income citizens in India.

Rules:
- Respond in the same language as the user.
- Use plain language always. Never use legal terminology.
- Replacements to follow strictly: injunction means court order to stop something, plaintiff means the person who filed the complaint, affidavit means a signed written statement, cognizable offence means a crime police can arrest for without a warrant, bail means temporary release from custody, stay order means a court order to pause something, ex parte means decided without hearing one side.
- Give practical legal guidance, not generic advice.
- Ground your guidance in Indian law context: Indian Penal Code (IPC) / Bharatiya Nyaya Sanhita (BNS), constitutional rights, and legal-aid rights relevant to the user scenario.
- Rights must be legally accurate for India and written in plain language.
- Next steps must be realistic, immediate, and safe based on user risk level and category.
- Return valid JSON only.
- Always include dynamic rights, next steps, emergency numbers, and a map search query.
- map_search_query should target nearest legal aid center or advocate relevant to the user category and urgency.
"""

def _language_instruction(selected_language):
    language = selected_language or "English"
    return f"User has selected {language}. Respond entirely in {language} regardless of what language they write in."


def _translate_response_payload(data, selected_language):
    if not selected_language or selected_language == "English":
        return data

    translated = dict(data)

    if isinstance(translated.get("response"), str):
        translated["response"] = translate_text(translated["response"], selected_language)

    if isinstance(translated.get("rights"), list):
        translated["rights"] = [
            {
                **item,
                **{
                    key: translate_text(value, selected_language)
                    for key, value in item.items()
                    if key in {"title", "desc", "description", "detail", "name"} and isinstance(value, str)
                },
            }
            if isinstance(item, dict)
            else item
            for item in translated["rights"]
        ]

    if isinstance(translated.get("next_steps"), list):
        translated["next_steps"] = [
            {
                **item,
                **{
                    key: translate_text(value, selected_language)
                    for key, value in item.items()
                    if key in {"title", "desc", "description", "detail", "name"} and isinstance(value, str)
                },
            }
            if isinstance(item, dict)
            else item
            for item in translated["next_steps"]
        ]

    if isinstance(translated.get("emergency_numbers"), list):
        translated["emergency_numbers"] = [
            {
                **item,
                **{
                    key: translate_text(value, selected_language)
                    for key, value in item.items()
                    if key == "name" and isinstance(value, str)
                },
            }
            if isinstance(item, dict)
            else item
            for item in translated["emergency_numbers"]
        ]

    return translated


def _generate_response_payload(user_input, selected_language="English", intake_context=None):
    language_instruction = _language_instruction(selected_language)

    context_block = ""
    if intake_context:
        category = intake_context.get("category", "general")
        follow_up_question = intake_context.get("followUpQuestion", "")
        follow_up_answer = intake_context.get("followUpAnswer", "")
        context_block = (
            f"\nStructured intake context:"
            f"\n- Category: {category}"
            f"\n- Follow-up question: {follow_up_question}"
            f"\n- Follow-up answer: {follow_up_answer}"
        )

    prompt = (
        f"{SYSTEM_PROMPT}\n"
        f"{language_instruction}\n"
        f"Use the structured context to make the advice specific and practical."
        f"{context_block}\n"
        f"User message: {user_input}"
    )
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        data = json.loads(response.text)
        data["response"] = remove_jargon(data.get("response", ""))
        data.setdefault("category", "general")
        data.setdefault("rights", [])
        data.setdefault("next_steps", [])
        data.setdefault("emergency_numbers", [{"name": "National Emergency", "number": "112"}])
        data.setdefault("map_search_query", "Nearest Legal Aid Clinic")
        return _translate_response_payload(data, selected_language)
    except Exception as e:
        fallback = {
            "response": remove_jargon("I am having trouble connecting to my legal database right now. Please try again."),
            "category": "general",
            "rights": [{"title": "Basic Constitutional Rights", "desc": "You have the right to seek justice under the Indian Constitution."}],
            "next_steps": [{"title": "Seek Counsel", "desc": "Please visit your nearest DLSA center."}],
            "emergency_numbers": [{"name": "National Emergency", "number": "112"}],
            "map_search_query": "Nearest Legal Aid Clinic"
        }
        return _translate_response_payload(fallback, selected_language)


def generate_analytical_response(user_input, selected_language="English", intake_context=None):
    return _generate_response_payload(user_input, selected_language=selected_language, intake_context=intake_context)


def generate_response(user_input):
    return _generate_response_payload(user_input).get("response", "")

def classify_category(text):
    prompt = f"Classify this legal issue into one of these exact categories: labor, domestic violence, tenancy, consumer, family, land dispute, harassment, or general. If unsure, output 'general'. Text: {text}"
    try:
        category = model.generate_content(prompt).text.strip().lower()
        return category
    except Exception:
        return "general"
