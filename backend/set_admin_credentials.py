import os
import firebase_admin
from firebase_admin import auth, credentials
from dotenv import load_dotenv

load_dotenv()

ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin@1234"
ADMIN_DISPLAY_NAME = "Admin"


def initialize_firebase() -> None:
    if firebase_admin._apps:
        return

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if cred_path and os.path.exists(cred_path):
        firebase_admin.initialize_app(credentials.Certificate(cred_path))
        return

    local_cred = os.path.join(os.path.dirname(__file__), "firebase_credentials.json")
    if os.path.exists(local_cred):
        firebase_admin.initialize_app(credentials.Certificate(local_cred))
        return

    firebase_admin.initialize_app()


def upsert_admin_user() -> None:
    try:
        user = auth.get_user_by_email(ADMIN_EMAIL)
        auth.update_user(
            user.uid,
            password=ADMIN_PASSWORD,
            display_name=ADMIN_DISPLAY_NAME,
            email_verified=True,
        )
        print(f"Updated admin user: {ADMIN_EMAIL}")
    except auth.UserNotFoundError:
        auth.create_user(
            email=ADMIN_EMAIL,
            password=ADMIN_PASSWORD,
            display_name=ADMIN_DISPLAY_NAME,
            email_verified=True,
        )
        print(f"Created admin user: {ADMIN_EMAIL}")


if __name__ == "__main__":
    initialize_firebase()
    upsert_admin_user()
    print("Admin credentials are ready.")
