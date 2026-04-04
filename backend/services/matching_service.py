import math
from firebase_admin import firestore

def calculate_distance(lat1, lng1, lat2, lng2):
    # Basic Euclidean distance for demo purposes
    return math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2)


def _category_tokens(category):
    normalized = (category or "general").strip().lower()
    mapping = {
        "labor": ["labor", "workers-rights", "wage-disputes"],
        "domestic violence": ["domestic", "women-rights", "harassment", "violence"],
        "tenancy": ["tenancy", "housing", "property", "eviction"],
        "consumer": ["consumer"],
        "family": ["family", "marriage", "women-rights"],
        "land dispute": ["land", "property"],
        "harassment": ["harassment", "women-rights", "domestic"],
        "general": ["all"],
    }
    return mapping.get(normalized, [normalized, "all"])

def get_nearest_centers(user_lat, user_lng, category):
    try:
        db = firestore.client()
        centers_ref = db.collection("centers").stream()
        
        centers = []
        fallback_centers = []
        category_tokens = _category_tokens(category)
        
        for doc in centers_ref:
            data = doc.to_dict()
            data['id'] = doc.id # Keep the document ID for frontend keys/refs
            
            categories = [str(item).strip().lower() for item in data.get("categories", [])]

            center_lat = data.get("lat") if data.get("lat") is not None else data.get("latitude")
            center_lng = data.get("lng") if data.get("lng") is not None else data.get("longitude")

            if center_lat is not None and center_lng is not None and user_lat is not None and user_lng is not None:
                dist = calculate_distance(float(user_lat), float(user_lng), float(center_lat), float(center_lng))
            else:
                dist = 9999

            center_row = {**data, "distance": dist}
            fallback_centers.append(center_row)

            if "all" in categories or any(token in categories for token in category_tokens):
                centers.append(center_row)

        # If no strict category match is found, still return nearest overall legal centers.
        selected = centers if len(centers) > 0 else fallback_centers
        selected.sort(key=lambda x: x["distance"])
        return selected[:3]  # top 3 nearest
    except Exception as e:
        print("Firebase Error or Not Initialized:", e)
        return []
