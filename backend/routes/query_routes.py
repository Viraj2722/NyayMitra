from flask import Blueprint, request, jsonify
from services.ai_service import generate_response, classify_category
from services.translation_service import detect_language, translate_to_english, translate_text
from services.matching_service import get_nearest_centers
from utils.urgency_detector import detect_urgency
from firebase_admin import firestore
import datetime

query_bp = Blueprint("query", __name__)

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
        docs = db.collection("queries").order_by("created_at", direction=firestore.Query.DESCENDING).limit(10).stream()

        queries = []
        for doc in docs:
            data = doc.to_dict()
            data["id"] = doc.id
            queries.append(data)

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
    ai_response = generate_response(user_input, selected_language, intake_context)

    # Step 4: Urgency detection
    urgent = detect_urgency(user_input)

    # Step 5: Category from intake if available, else AI classification
    category_from_intake = intake_context.get("category") if isinstance(intake_context, dict) else None
    category = category_from_intake or classify_category(translated)

    # Step 6: Find centers
    # If no lat/lng, we still return top centers based on category
    centers = get_nearest_centers(lat or 0, lng or 0, category)

    # Step 7: Note - We are now securely saving data to Firebase Data Connect 
    # directly from the Next.js frontend to avoid duplicate saving and credential issues.
    
    return jsonify({
        "response": ai_response,
        "category": category,
        "urgent": urgent,
        "centers": centers,
        "detected_language": lang,
        "selected_language": selected_language,
        "intake_context": intake_context
    })
