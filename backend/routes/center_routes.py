from flask import Blueprint, jsonify
from firebase_admin import firestore

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

        return jsonify(centers)
    except Exception as e:
        print("Center load failed, returning empty list:", e)
        return jsonify([]), 200
