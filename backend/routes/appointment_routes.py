from flask import Blueprint, request, jsonify
from firebase_admin import firestore
import datetime

appointment_bp = Blueprint("appointments", __name__)


def _serialize_appointment(doc):
    data = doc.to_dict() or {}
    created_at = data.get("created_at")
    if hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()

    return {
        "id": doc.id,
        "user_id": data.get("user_id"),
        "center_id": data.get("center_id"),
        "center_name": data.get("center_name"),
        "center_address": data.get("center_address"),
        "center_phone": data.get("center_phone"),
        "name": data.get("name"),
        "phone": data.get("phone"),
        "issue_summary": data.get("issue_summary"),
        "date": data.get("date"),
        "time": data.get("time"),
        "status": data.get("status"),
        "created_at": created_at,
    }


def _sort_appointments_desc(appointments):
    def sort_key(item):
        created_at = item.get("created_at")
        if isinstance(created_at, str):
            try:
                return datetime.datetime.fromisoformat(created_at)
            except ValueError:
                return datetime.datetime.min
        if isinstance(created_at, datetime.datetime):
            return created_at
        return datetime.datetime.min

    return sorted(appointments, key=sort_key, reverse=True)


def _appointments_collection():
    db = firestore.client()
    return db.collection("appointments")


def _get_appointment_or_404(appointment_id):
    doc = _appointments_collection().document(appointment_id).get()
    if not doc.exists:
        return None
    return doc

@appointment_bp.route("/", methods=["POST"])
def book_appointment():
    data = request.json
    
    try:
        center_id = data.get("center_id")

        if not center_id:
            return jsonify({"error": "center_id is required"}), 400

        doc_ref = _appointments_collection().add({
            "user_id": data.get("user_id", "anonymous"),
            "center_id": center_id,
            "center_name": data.get("center_name"),
            "center_address": data.get("center_address"),
            "center_phone": data.get("center_phone"),
            "name": data.get("name"),
            "phone": data.get("phone"),
            "issue_summary": data.get("issue_summary") or data.get("issue"),
            "date": data.get("date"),
            "time": data.get("time"),
            "status": data.get("status", "pending"),
            "created_at": datetime.datetime.utcnow(),
        })
        return jsonify({"message": "Appointment booked successfully", "id": doc_ref[0].id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/recent", methods=["GET"])
def recent_appointments():
    try:
        limit = int(request.args.get("limit", 20))
        docs = _appointments_collection().stream()
        appointments = [_serialize_appointment(doc) for doc in docs]
        return jsonify(_sort_appointments_desc(appointments)[:limit])
    except Exception as e:
        print("Recent appointment load failed, returning empty list:", e)
        return jsonify([]), 200


@appointment_bp.route("/mine", methods=["GET"])
def my_appointments():
    try:
        user_id = request.args.get("user_id")
        if not user_id:
            return jsonify([]), 200

        docs = _appointments_collection().where("user_id", "==", user_id).stream()
        appointments = [_serialize_appointment(doc) for doc in docs]
        return jsonify(_sort_appointments_desc(appointments))
    except Exception as e:
        print("User appointment load failed, returning empty list:", e)
        return jsonify([]), 200


@appointment_bp.route("/<appointment_id>", methods=["GET"])
def get_appointment(appointment_id):
    try:
        doc = _get_appointment_or_404(appointment_id)
        if not doc:
            return jsonify({"error": "Appointment not found"}), 404

        return jsonify(_serialize_appointment(doc)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/<appointment_id>", methods=["PATCH"])
def update_appointment(appointment_id):
    try:
        doc = _get_appointment_or_404(appointment_id)
        if not doc:
            return jsonify({"error": "Appointment not found"}), 404

        payload = request.json or {}
        updates = {}
        for field in ("status", "date", "time", "issue_summary"):
            if field in payload and payload[field] is not None:
                updates[field] = payload[field]

        if not updates:
            return jsonify({"error": "No updatable fields provided"}), 400

        updates["updated_at"] = datetime.datetime.utcnow()
        _appointments_collection().document(appointment_id).update(updates)
        updated_doc = _appointments_collection().document(appointment_id).get()
        return jsonify(_serialize_appointment(updated_doc)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@appointment_bp.route("/<appointment_id>", methods=["DELETE"])
def cancel_appointment(appointment_id):
    try:
        doc = _get_appointment_or_404(appointment_id)
        if not doc:
            return jsonify({"error": "Appointment not found"}), 404

        _appointments_collection().document(appointment_id).update({
            "status": "cancelled",
            "updated_at": datetime.datetime.utcnow(),
        })
        updated_doc = _appointments_collection().document(appointment_id).get()
        return jsonify(_serialize_appointment(updated_doc)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
