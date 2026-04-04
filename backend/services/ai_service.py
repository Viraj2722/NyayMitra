import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env')
load_dotenv(env_path)

import google.generativeai as genai

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash")

SYSTEM_PROMPT = """
You are NyayMitra, a compassionate legal aid assistant for low-income citizens in India.

Rules:
- Respond in same language as user
- Use simple language
- Max 4-5 sentences
- Mention legal rights clearly
- End with: "You are not alone, help is available near you"
"""

LANGUAGE_INSTRUCTION_MAP = {
    "English": "User has selected English. Respond entirely in English regardless of what language they write in.",
    "Hindi": "User has selected Hindi. Respond entirely in Hindi regardless of what language they write in.",
    "Marathi": "User has selected Marathi. Respond entirely in Marathi regardless of what language they write in.",
}


def generate_response(user_input, selected_language="English", intake_context=None):
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
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error connecting to AI: {str(e)}"

def classify_category(text):
    prompt = f"Classify this legal issue into one of these exact categories: labor, domestic, tenancy, consumer, family, or land. If unsure, output 'general'. Text: {text}"
    try:
        category = model.generate_content(prompt).text.strip().lower()
        return category
    except Exception:
        return "general"
