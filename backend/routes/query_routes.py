from flask import Blueprint, request, jsonify
from services.ai_service import generate_response, classify_category
from services.translation_service import detect_language, translate_to_english
from services.matching_service import get_nearest_centers
from utils.urgency_detector import detect_urgency
from firebase_admin import firestore
import datetime

query_bp = Blueprint("query", __name__)

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

    if not user_input:
        return jsonify({"error": "No text provided"}), 400

    # Step 1: Detect language
    lang = detect_language(user_input)

    # Step 2: Translate if needed
    translated = translate_to_english(user_input)

    # Step 3: AI response
    ai_response = generate_response(user_input)

    # Step 4: Urgency detection
    urgent = detect_urgency(user_input)

    # Step 5: Category Classification using AI
    category = classify_category(translated)

    # Step 6: Find centers
    # If no lat/lng, we still return top centers based on category
    centers = get_nearest_centers(lat or 0, lng or 0, category)

    # Step 7: Save query (Skip if anonymous)
    if not is_anonymous:
        try:
            db = firestore.client()
            db.collection("queries").add({
                # Notice we do NOT store the raw user input text to maintain privacy
                "translated_keywords": translated[:100], # store a snippet or just omit
                "language": lang,
                "category": category,
                "urgency": "high" if urgent else "normal",
                "isAnonymous": is_anonymous,
                "created_at": datetime.datetime.utcnow()
            })
        except Exception as e:
            print("Failed to save query to DB:", e)

    return jsonify({
        "response": ai_response,
        "category": category,
        "urgent": urgent,
        "centers": centers,
        "detected_language": lang
    })
