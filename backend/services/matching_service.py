import math
from firebase_admin import firestore

def calculate_distance(lat1, lng1, lat2, lng2):
    # Basic Euclidean distance for demo purposes
    return math.sqrt((lat1 - lat2)**2 + (lng1 - lng2)**2)

def get_nearest_centers(user_lat, user_lng, category):
    try:
        db = firestore.client()
        centers_ref = db.collection("centers").stream()
        
        centers = []
        
        for doc in centers_ref:
            data = doc.to_dict()
            data['id'] = doc.id # Keep the document ID for frontend keys/refs
            
            categories = data.get("categories", [])
            
            if "all" in categories or category in categories:
                # Assuming location is stored as lat/lng directly or in a map
                center_lat = data.get("lat")
                center_lng = data.get("lng")
                
                if center_lat and center_lng and user_lat and user_lng:
                    dist = calculate_distance(user_lat, user_lng, center_lat, center_lng)
                    centers.append({**data, "distance": dist})
                else:
                    # If coordinates are missing, append with a high distance
                    centers.append({**data, "distance": 9999})

        centers.sort(key=lambda x: x["distance"])
        return centers[:3]  # top 3 nearest
    except Exception as e:
        print("Firebase Error or Not Initialized:", e)
        return []
