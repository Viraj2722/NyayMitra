import os
import json
import re
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env')
load_dotenv(env_path)

import google.generativeai as genai
from services.legal_rag_service import retrieve_legal_context

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


def _fallback_citations(rag_sources, limit=3):
    return [
        {
            "law_name": s.get("law_name"),
            "page": s.get("page"),
            "source_url": s.get("source_url"),
            "excerpt": s.get("excerpt"),
        }
        for s in rag_sources[:limit]
    ]


def _normalize_citations(raw_citations, rag_sources):
    normalized = []

    if isinstance(raw_citations, list):
        for item in raw_citations:
            if isinstance(item, dict):
                law_name = str(item.get("law_name") or item.get("law") or "").strip()
                source_url = str(item.get("source_url") or item.get("url") or "").strip()
                excerpt = str(item.get("excerpt") or item.get("quote") or "").strip()
                page = item.get("page")
                if law_name or source_url or excerpt:
                    normalized.append(
                        {
                            "law_name": law_name,
                            "page": page,
                            "source_url": source_url,
                            "excerpt": excerpt,
                        }
                    )

    if not normalized:
        return _fallback_citations(rag_sources, limit=3)

    return normalized[:3]


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
- Always include citations as an array under key "citations".
- map_search_query should target nearest legal aid center or advocate relevant to the user category and urgency.
"""

LANGUAGE_INSTRUCTION_MAP = {
    "English": "User has selected English. Respond entirely in English regardless of what language they write in.",
    "Hindi": "User has selected Hindi. Respond entirely in Hindi regardless of what language they write in.",
    "Marathi": "User has selected Marathi. Respond entirely in Marathi regardless of what language they write in.",
}


ALLOWED_LAWS_BY_CATEGORY = {
    "labor": ["Constitution_of_India", "Contract_Act_1872"],
    "domestic violence": ["BNS_2023", "BNSS_2023", "Constitution_of_India"],
    "tenancy": ["Constitution_of_India", "BNSS_2023", "Contract_Act_1872"],
    "consumer": ["Contract_Act_1872", "Constitution_of_India"],
    "family": ["Constitution_of_India", "BNSS_2023"],
    "land dispute": ["Contract_Act_1872", "Constitution_of_India", "BNSS_2023"],
    "harassment": ["BNS_2023", "BNSS_2023", "Constitution_of_India"],
    "general": [
        "Constitution_of_India",
        "BNS_2023",
        "BNSS_2023",
        "BSA_2023",
        "Contract_Act_1872",
    ],
}


DEFAULT_BY_CATEGORY = {
    "labor": {
        "rights": [
            {"title": "Right to be paid on time", "desc": "You have the right to receive wages without unfair delay."},
            {"title": "Right against unfair termination", "desc": "You cannot be removed from work without due process."},
            {"title": "Right to legal aid", "desc": "You can seek free legal help through legal services authorities."},
        ],
        "next_steps": [
            {"title": "Collect salary proof", "desc": "Keep salary slips, messages, and attendance records ready."},
            {"title": "Write complaint summary", "desc": "Make a short timeline of what happened with dates."},
            {"title": "Visit labor/legal aid office", "desc": "Approach nearest labor office or free legal aid center."},
        ],
        "map_search_query": "Nearest labor legal aid center",
    },
    "domestic violence": {
        "rights": [
            {"title": "Right to immediate protection", "desc": "You can seek urgent protection from violence."},
            {"title": "Right to safe shelter", "desc": "You can ask for safe accommodation and support services."},
            {"title": "Right to free legal help", "desc": "You can access free legal aid and women support cells."},
        ],
        "next_steps": [
            {"title": "Move to a safe place", "desc": "Prioritize safety and contact trusted support immediately."},
            {"title": "Call emergency helplines", "desc": "Call police or women helpline for immediate support."},
            {"title": "Preserve evidence", "desc": "Keep photos, messages, and medical records safely."},
        ],
        "map_search_query": "Nearest women help center",
    },
    "tenancy": {
        "rights": [
            {"title": "Right to due process in eviction", "desc": "You cannot be evicted arbitrarily without legal process."},
            {"title": "Right to receipt and records", "desc": "You can ask for written rent/payment records."},
            {"title": "Right to legal aid", "desc": "You can seek free legal advice for housing disputes."},
        ],
        "next_steps": [
            {"title": "Gather rent documents", "desc": "Keep rent agreement, receipts, and chats ready."},
            {"title": "Record timeline", "desc": "Write down notices, threats, and dates clearly."},
            {"title": "Seek local legal aid", "desc": "Visit nearest legal aid center for tenancy support."},
        ],
        "map_search_query": "Nearest tenancy legal aid center",
    },
    "consumer": {
        "rights": [
            {"title": "Right to safe goods and services", "desc": "You have a right to safe and fair services."},
            {"title": "Right to complaint and redress", "desc": "You can file complaint for defective goods/services."},
            {"title": "Right to legal support", "desc": "You can get legal help for consumer dispute resolution."},
        ],
        "next_steps": [
            {"title": "Keep proof of purchase", "desc": "Store bill, invoice, warranty card, and chats."},
            {"title": "Send written complaint", "desc": "Share a concise written grievance with seller/provider."},
            {"title": "Approach consumer support", "desc": "Visit consumer helpdesk or legal aid for filing."},
        ],
        "map_search_query": "Nearest consumer legal aid center",
    },
    "family": {
        "rights": [
            {"title": "Right to legal protection", "desc": "You can seek legal protection in family disputes."},
            {"title": "Right to maintenance/support", "desc": "Eligible persons can seek maintenance under law."},
            {"title": "Right to free legal aid", "desc": "You can access legal services authority support."},
        ],
        "next_steps": [
            {"title": "Collect key records", "desc": "Keep identity, marriage, and related documents ready."},
            {"title": "Document events", "desc": "Write a calm timeline with important dates."},
            {"title": "Meet legal counselor", "desc": "Visit nearest family legal aid or counseling center."},
        ],
        "map_search_query": "Nearest family legal aid center",
    },
    "land dispute": {
        "rights": [
            {"title": "Right to protect possession", "desc": "You can seek legal protection for lawful possession."},
            {"title": "Right to record verification", "desc": "You can verify ownership and land records officially."},
            {"title": "Right to legal aid", "desc": "You can get free legal support for land disputes."},
        ],
        "next_steps": [
            {"title": "Collect land records", "desc": "Keep title, tax receipts, and survey papers ready."},
            {"title": "Write dispute summary", "desc": "List encroachment/dispute events with dates."},
            {"title": "Consult legal aid center", "desc": "Approach nearest land/property legal support desk."},
        ],
        "map_search_query": "Nearest land dispute legal aid center",
    },
    "harassment": {
        "rights": [
            {"title": "Right to safety", "desc": "You can seek immediate protection from harassment."},
            {"title": "Right to report misconduct", "desc": "You can report harassment to relevant authorities."},
            {"title": "Right to legal assistance", "desc": "You can access free legal and support services."},
        ],
        "next_steps": [
            {"title": "Move to safe contact", "desc": "Contact a trusted person and stay in a safe location."},
            {"title": "Preserve evidence", "desc": "Keep call logs, messages, and incident details."},
            {"title": "Report and seek aid", "desc": "Reach police/women desk and legal aid center."},
        ],
        "map_search_query": "Nearest women help center",
    },
    "general": {
        "rights": [
            {"title": "Right to legal information", "desc": "You can ask for clear legal guidance and support."},
            {"title": "Right to free legal aid", "desc": "Eligible citizens can receive free legal assistance."},
            {"title": "Right to fair process", "desc": "Your issue should be handled through lawful procedure."},
        ],
        "next_steps": [
            {"title": "Note the facts", "desc": "Write what happened in simple points with dates."},
            {"title": "Collect supporting records", "desc": "Keep documents, bills, and messages safely."},
            {"title": "Visit legal aid center", "desc": "Get personalized help from nearby legal aid services."},
        ],
        "map_search_query": "Nearest legal aid center",
    },
}


def _normalize_items(raw, fallback_items):
    normalized = []

    if isinstance(raw, list):
        for item in raw:
            if isinstance(item, str) and item.strip():
                normalized.append({"title": item.strip(), "desc": ""})
            elif isinstance(item, dict):
                title = str(item.get("title") or item.get("name") or item.get("right") or item.get("step") or "").strip()
                desc = str(item.get("desc") or item.get("description") or item.get("detail") or "").strip()
                if title or desc:
                    normalized.append({"title": title or "Item", "desc": desc})

    if len(normalized) == 0:
        normalized = list(fallback_items)

    while len(normalized) < 3 and len(fallback_items) > len(normalized):
        normalized.append(fallback_items[len(normalized)])

    return normalized[:3]


def _normalized_category(raw_category):
    value = str(raw_category or "general").strip().lower()
    allowed = set(DEFAULT_BY_CATEGORY.keys())
    return value if value in allowed else "general"


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

    context_category = "general"
    if isinstance(intake_context, dict):
        context_category = _normalized_category(intake_context.get("category"))

    allowed_laws = ALLOWED_LAWS_BY_CATEGORY.get(context_category, ALLOWED_LAWS_BY_CATEGORY["general"])
    rag_context, rag_sources = retrieve_legal_context(user_input, top_k=4, allowed_laws=allowed_laws)
    rag_block = ""
    if rag_context:
        rag_block = (
            "\nUse only the verified legal context below for legal claims."
            "\nIf context is missing for a claim, clearly say so."
            f"\nVerified legal context:\n{rag_context}"
        )

    prompt = (
        f"{SYSTEM_PROMPT}\n"
        f"{language_instruction}\n"
        f"Use the structured context to make the advice specific and practical."
        f"{rag_block}\n"
        f"Return JSON keys: response, category, rights, next_steps, emergency_numbers, map_search_query, citations."
        f"{context_block}\n"
        f"User message: {user_input}"
    )
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(response_mime_type="application/json")
        )
        data = json.loads(response.text)

        category = _normalized_category(data.get("category"))
        fallback = DEFAULT_BY_CATEGORY.get(category, DEFAULT_BY_CATEGORY["general"])

        response_text = remove_jargon(str(data.get("response", "")).strip())
        if not response_text:
            response_text = remove_jargon("I understand your issue. I have prepared practical legal guidance for you.")

        data["response"] = response_text
        data["category"] = category
        data["rights"] = _normalize_items(data.get("rights"), fallback["rights"])
        data["next_steps"] = _normalize_items(data.get("next_steps"), fallback["next_steps"])

        emergency_numbers = data.get("emergency_numbers")
        if not isinstance(emergency_numbers, list) or len(emergency_numbers) == 0:
            emergency_numbers = [{"name": "National Emergency", "number": "112"}]
        data["emergency_numbers"] = emergency_numbers

        map_query = str(data.get("map_search_query", "")).strip()
        data["map_search_query"] = map_query or fallback["map_search_query"]

        data["citations"] = _normalize_citations(data.get("citations"), rag_sources)

        return data
    except Exception as e:
        return {
            "response": remove_jargon("I am having trouble connecting to my legal database right now. Please try again."),
            "category": "general",
            "rights": [{"title": "Basic Constitutional Rights", "desc": "You have the right to seek justice under the Indian Constitution."}],
            "next_steps": [{"title": "Seek Counsel", "desc": "Please visit your nearest DLSA center."}],
            "emergency_numbers": [{"name": "National Emergency", "number": "112"}],
            "map_search_query": "Nearest Legal Aid Clinic",
            "citations": _fallback_citations(rag_sources, limit=2),
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
