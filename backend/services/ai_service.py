import os
import json
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env')
load_dotenv(env_path)

import google.generativeai as genai

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
    for term, replacement in JARGON_MAP.items():
        text = text.lower().replace(term, replacement)
    return text


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

LANGUAGE_INSTRUCTION_MAP = {
    "English": "User has selected English. Respond entirely in English regardless of what language they write in.",
    "Hindi": "User has selected Hindi. Respond entirely in Hindi regardless of what language they write in.",
    "Marathi": "User has selected Marathi. Respond entirely in Marathi regardless of what language they write in.",
}


def _generate_response_payload(user_input, selected_language="English", intake_context=None):
    language_instruction = LANGUAGE_INSTRUCTION_MAP.get(
        selected_language,
        LANGUAGE_INSTRUCTION_MAP["English"],
    )

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
        return data
    except Exception as e:
        return {
            "response": remove_jargon("I am having trouble connecting to my legal database right now. Please try again."),
            "category": "general",
            "rights": [{"title": "Basic Constitutional Rights", "desc": "You have the right to seek justice under the Indian Constitution."}],
            "next_steps": [{"title": "Seek Counsel", "desc": "Please visit your nearest DLSA center."}],
            "emergency_numbers": [{"name": "National Emergency", "number": "112"}],
            "map_search_query": "Nearest Legal Aid Clinic"
        }


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
