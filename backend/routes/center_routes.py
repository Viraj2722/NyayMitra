from flask import Blueprint, jsonify, request
from firebase_admin import firestore
import datetime

center_bp = Blueprint("centers", __name__)

@center_bp.route("/", methods=["GET"])
def get_centers():
    try:
        db = firestore.client()
        centers = []
        docs = db.collection("centers").stream()
        
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            centers.append(data)

        centers.sort(key=lambda item: (not bool(item.get("emergency")), -(item.get("priority") or 0), item.get("name") or ""))

        return jsonify(centers)
    except Exception as e:
        print("Center load failed, returning empty list:", e)
        return jsonify([]), 200


@center_bp.route("/", methods=["POST"])
def create_center():
    try:
        payload = request.json or {}

        required_fields = ["name", "address", "phone"]
        missing = [field for field in required_fields if not payload.get(field)]
        if missing:
            return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

        categories = payload.get("categories") or []
        if not isinstance(categories, list):
            categories = [categories]

        services = payload.get("services") or []
        if not isinstance(services, list):
            services = [services]

        languages = payload.get("languages") or []
        if not isinstance(languages, list):
            languages = [languages]

        db = firestore.client()
        name_query = payload.get("name").strip()
        phone_query = payload.get("phone").strip()

        # Check for existing duplicate center
        existing_docs = list(db.collection("centers").where("name", "==", name_query).where("phone", "==", phone_query).limit(1).stream())
        if existing_docs:
            return jsonify({"error": f"A center named '{name_query}' with this phone number already exists in the database."}), 409

        db = firestore.client()
        doc_ref = db.collection("centers").add({
            "name": payload.get("name"),
            "address": payload.get("address"),
            "phone": payload.get("phone"),
            "categories": categories,
            "services": services,
            "languages": languages,
            "description": payload.get("description", ""),
            "timings": payload.get("timings", "Mon-Sat 10AM-5PM"),
            "freeServices": bool(payload.get("freeServices", True)),
            "emergency": bool(payload.get("emergency", False)),
            "priority": int(payload.get("priority", 0) or 0),
            "contactPerson": payload.get("contactPerson", ""),
            "lat": payload.get("lat"),
            "lng": payload.get("lng"),
            "latitude": payload.get("latitude"),
            "longitude": payload.get("longitude"),
            "helpline": payload.get("helpline", ""),
            "documents": payload.get("documents", []),
            "updated_at": datetime.datetime.utcnow(),
            "created_at": datetime.datetime.utcnow(),
        })

        return jsonify({"message": "Center created successfully", "id": doc_ref[1].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
