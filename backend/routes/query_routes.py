from flask import Blueprint, request, jsonify
from services.ai_service import generate_analytical_response
from services.translation_service import detect_language, translate_to_english, translate_text
from services.matching_service import get_nearest_centers
from utils.urgency_detector import detect_urgency
from firebase_admin import firestore
import datetime

query_bp = Blueprint("query", __name__)


LOCALIZED_FALLBACK_RESPONSE = {
    "English": "I understood your issue and prepared guidance for {category}.",
    "Hindi": "मैंने आपकी समस्या समझ ली है और {category} के लिए मार्गदर्शन तैयार किया है।",
    "Marathi": "मी तुमची समस्या समजून घेतली आहे आणि {category} साठी मार्गदर्शन तयार केले आहे.",
    "Bengali": "আমি আপনার সমস্যা বুঝেছি এবং {category} এর জন্য নির্দেশনা প্রস্তুত করেছি।",
    "Gujarati": "મેં તમારી સમસ્યા સમજી લીધી છે અને {category} માટે માર્ગદર્શન તૈયાર કર્યું છે.",
    "Tamil": "நான் உங்கள் பிரச்சினையைப் புரிந்துகொண்டேன், {category} க்கான வழிகாட்டுதலைத் தயார் செய்துள்ளேன்.",
    "Telugu": "నేను మీ సమస్యను అర్థం చేసుకున్నాను మరియు {category} కోసం మార్గదర్శకాన్ని సిద్ధం చేశాను.",
    "Kannada": "ನಾನು ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ ಮತ್ತು {category}ಗಾಗಿ ಮಾರ್ಗದರ್ಶನವನ್ನು ತಯಾರಿಸಿದ್ದೇನೆ.",
    "Malayalam": "ഞാൻ നിങ്ങളുടെ പ്രശ്നം മനസ്സിലാക്കി, {category}യ്ക്കായി മാർഗനിർദേശം തയ്യാറാക്കി.",
    "Punjabi": "ਮੈਂ ਤੁਹਾਡੀ ਸਮੱਸਿਆ ਸਮਝ ਲਈ ਹੈ ਅਤੇ {category} ਲਈ ਮਾਰਗਦਰਸ਼ਨ ਤਿਆਰ ਕੀਤਾ ਹੈ।",
    "Urdu": "میں نے آپ کا مسئلہ سمجھ لیا ہے اور {category} کے لیے رہنمائی تیار کی ہے۔",
}


def _localized_response_template(selected_language, category):
    template = LOCALIZED_FALLBACK_RESPONSE.get(selected_language, LOCALIZED_FALLBACK_RESPONSE["English"])
    return template.format(category=category or "general")


def _serialize_query(doc):
    data = doc.to_dict() or {}
    created_at = data.get("created_at")
    if hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()

    return {
        "id": doc.id,
        "user_id": data.get("user_id"),
        "queryText": data.get("queryText"),
        "detectedLanguage": data.get("detectedLanguage"),
        "selectedResponseLanguage": data.get("selectedResponseLanguage"),
        "legalCategoryDetected": data.get("legalCategoryDetected"),
        "intakeFollowUpQuestion": data.get("intakeFollowUpQuestion"),
        "intakeFollowUpAnswer": data.get("intakeFollowUpAnswer"),
        "isUrgent": data.get("isUrgent", False),
        "isAnonymous": data.get("isAnonymous", False),
        "aiResponse": data.get("aiResponse"),
        "citations": data.get("citations", []),
        "translated_keywords": data.get("translated_keywords"),
        "language": data.get("detectedLanguage") or data.get("selectedResponseLanguage"),
        "category": data.get("legalCategoryDetected"),
        "urgency": "high" if data.get("isUrgent") else "normal",
        "created_at": created_at,
        "source": data.get("source", "live"),
    }

@query_bp.route("/translate-ui", methods=["POST"])
def translate_ui_text():
    payload = request.json or {}
    target_language = payload.get("targetLanguage", "English")
    entries = payload.get("entries", [])

    if not isinstance(entries, list):
        return jsonify({"error": "entries must be a list"}), 400

    translated_entries = []
    for item in entries:
        key = item.get("key") if isinstance(item, dict) else None
        text = item.get("text") if isinstance(item, dict) else None
        if not key or not text:
            continue
        translated_entries.append({
            "key": key,
            "text": translate_text(text, target_language)
        })

    return jsonify({"translations": translated_entries})

@query_bp.route("/recent", methods=["GET"])
def recent_queries():
    try:
        db = firestore.client()
        live_docs = db.collection("live_queries").order_by("created_at", direction=firestore.Query.DESCENDING).limit(10).stream()
        queries = [_serialize_query(doc) for doc in live_docs]

        if not queries:
            fallback_docs = db.collection("queries").order_by("created_at", direction=firestore.Query.DESCENDING).limit(10).stream()
            queries = [_serialize_query(doc) for doc in fallback_docs]

        return jsonify(queries)
    except Exception as e:
        print("Recent query load failed, returning empty list:", e)
        return jsonify([]), 200

@query_bp.route("/", methods=["POST"])
def handle_query():
    data = request.json
    
    user_input = data.get("text", "")
    lat = data.get("lat")
    lng = data.get("lng")
    is_anonymous = data.get("isAnonymous", False)
    selected_language = data.get("selectedLanguage", "English")
    intake_context = data.get("intakeContext", {})

    if not user_input:
        return jsonify({"error": "No text provided"}), 400

    # Step 1: Detect language
    lang = detect_language(user_input)

    # Step 2: Translate if needed
    translated = translate_to_english(user_input)

    # Step 3: AI response with hard language lock + intake context
    ai_json = generate_analytical_response(translated, selected_language, intake_context)
    ai_response = (ai_json.get("response") or "").strip()

    # Step 4: Urgency detection
    urgent = detect_urgency(user_input)

    # Step 5: Category from intake if available, else AI classification
    category_from_intake = intake_context.get("category") if isinstance(intake_context, dict) else None
    category = category_from_intake or ai_json.get("category", "general")
    rights = ai_json.get("rights", [])
    next_steps = ai_json.get("next_steps", [])
    emergency_numbers = ai_json.get("emergency_numbers", [])
    map_search_query = ai_json.get("map_search_query", "Nearest Legal Aid Clinic")
    citations = ai_json.get("citations", [])

    if not ai_response:
        ai_response = _localized_response_template(selected_language, category)

    # Step 6: Find centers
    # If no lat/lng, we still return top centers based on category
    centers = get_nearest_centers(lat or 0, lng or 0, category)

    # Step 7: Note - We are now securely saving data to Firebase Data Connect 
    # directly from the Next.js frontend to avoid duplicate saving and credential issues.

    try:
        db = firestore.client()
        db.collection("live_queries").add({
            "user_id": data.get("userId"),
            "queryText": user_input,
            "detectedLanguage": lang,
            "selectedResponseLanguage": selected_language,
            "legalCategoryDetected": category,
            "intakeFollowUpQuestion": intake_context.get("followUpQuestion") if isinstance(intake_context, dict) else None,
            "intakeFollowUpAnswer": intake_context.get("followUpAnswer") if isinstance(intake_context, dict) else None,
            "isUrgent": urgent,
            "isAnonymous": is_anonymous,
            "aiResponse": ai_response,
            "citations": citations,
            "translated_keywords": translated,
            "source": "live",
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow(),
        })
    except Exception as db_error:
        print("Failed to persist live query to Firestore:", db_error)
    
    return jsonify({
        "response": ai_response,
        "category": category,
        "urgent": urgent,
        "centers": centers,
        "rights": rights,
        "next_steps": next_steps,
        "emergency_numbers": emergency_numbers,
        "map_search_query": map_search_query,
        "citations": citations,
        "detected_language": lang,
        "selected_language": selected_language,
        "intake_context": intake_context
    })
