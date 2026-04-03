from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import datetime

appointment_bp = Blueprint("appointments", __name__)

@appointment_bp.route("/", methods=["POST"])
def book_appointment():
    data = request.json
    
    try:
        db = firestore.client()
        db.collection("appointments").add({
            "user_id": data.get("user_id", "anonymous"),
            "center_id": data.get("center_id"),
            "name": data.get("name"),
            "phone": data.get("phone"),
            "issue_summary": data.get("issue"),
            "date": data.get("date"),
            "time": data.get("time"),
            "status": "pending",
            "created_at": datetime.datetime.utcnow()
        })
        return jsonify({"message": "Appointment booked successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
