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

def generate_response(user_input):
    prompt = f"{SYSTEM_PROMPT}\nUser: {user_input}"
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
