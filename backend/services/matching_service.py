import math
from firebase_admin import firestore

def calculate_distance(lat1, lng1, lat2, lng2):
    # Haversine distance in kilometers.
    radius_km = 6371.0

    lat1_rad = math.radians(float(lat1))
    lng1_rad = math.radians(float(lng1))
    lat2_rad = math.radians(float(lat2))
    lng2_rad = math.radians(float(lng2))

    delta_lat = lat2_rad - lat1_rad
    delta_lng = lng2_rad - lng1_rad

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lng / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


def _normalize_categories(raw_categories):
    if isinstance(raw_categories, list):
        categories = raw_categories
    elif raw_categories:
        categories = [raw_categories]
    else:
        categories = []

    return [str(item).strip().lower() for item in categories if str(item).strip()]


def _normalize_center(doc, source_collection):
    data = doc.to_dict() or {}
    latitude = data.get("lat") if data.get("lat") is not None else data.get("latitude")
    longitude = data.get("lng") if data.get("lng") is not None else data.get("longitude")

    try:
        latitude = float(latitude) if latitude is not None else None
    except (TypeError, ValueError):
        latitude = None

    try:
        longitude = float(longitude) if longitude is not None else None
    except (TypeError, ValueError):
        longitude = None

    normalized = {**data}
    normalized.update({
        "id": doc.id,
        "source": source_collection,
        "name": data.get("name") or "Legal Aid Center",
        "address": data.get("address") or "",
        "phone": data.get("phone") or "",
        "latitude": latitude,
        "longitude": longitude,
        "lat": latitude,
        "lng": longitude,
        "categories": _normalize_categories(data.get("categories")),
        "freeServices": bool(data.get("freeServices", True)),
    })

    return normalized


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
        centers = []
        fallback_centers = []
        category_tokens = _category_tokens(category)
        seen_keys = set()

        for collection_name in ("centers", "legalAidCenter"):
            for doc in db.collection(collection_name).stream():
                data = _normalize_center(doc, collection_name)

                dedupe_key = "|".join([
                    data.get("name", "").strip().lower(),
                    data.get("address", "").strip().lower(),
                    data.get("phone", "").strip().lower(),
                ])
                if dedupe_key in seen_keys:
                    continue
                seen_keys.add(dedupe_key)

                categories = data.get("categories", [])

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
