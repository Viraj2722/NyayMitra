import os
import firebase_admin
from firebase_admin import credentials
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase Admin SDK
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
try:
    if firebase_cred_path and os.path.exists(firebase_cred_path):
        cred = credentials.Certificate(firebase_cred_path)
        firebase_admin.initialize_app(cred)
    else:
        # Attempt to initialize without explicit credentials (e.g. if deployed)
        try:
            firebase_admin.initialize_app()
        except Exception as inner_e:
            print("Firebase Admin not initialized locally: ", inner_e)
            
except ValueError:
    print("Warning: Firebase is already initialized")
except Exception as e:
    print("Warning: Firebase default credentials not found or invalid. DB calls will fall back to dummy data.", e)

from routes.query_routes import query_bp
from routes.center_routes import center_bp
from routes.appointment_routes import appointment_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(query_bp, url_prefix="/api/query")
app.register_blueprint(center_bp, url_prefix="/api/centers")
app.register_blueprint(appointment_bp, url_prefix="/api/appointments")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "message": "NyayMitra Backend is running!"
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)
