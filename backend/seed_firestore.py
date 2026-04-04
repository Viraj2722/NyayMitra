#!/usr/bin/env python3
"""
Data Connect Seeder (kept as seed_firestore.py for backward compatibility)
Seeds sample data into Firebase Data Connect tables via executeMutation API.
"""

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from datetime import date, timedelta

from dotenv import load_dotenv

# Load backend env first, then frontend env for NEXT_PUBLIC_* keys.
load_dotenv()
load_dotenv("../.env.local")
load_dotenv("../.env")

SAMPLE_USERS = [
    {
        "uid": "seed-user-001",
        "name": "Ramesh Kumar",
        "preferredLanguage": "hi",
        "mobile": "9876543210",
    },
    {
        "uid": "seed-user-002",
        "name": "Sita Devi",
        "preferredLanguage": "en",
        "mobile": "9898989898",
    },
    {
        "uid": "seed-user-003",
        "name": "Aarav Patil",
        "preferredLanguage": "mr",
        "mobile": "9765432109",
    },
]

SAMPLE_CENTERS = [
    {
        "name": "Delhi Women Legal Aid Center",
        "address": "Plot 57, Sector 17, Delhi",
        "phone": "+91-11-4141-4141",
        "latitude": 28.5921,
        "longitude": 77.2064,
        "freeServices": True,
        "categories": ["domestic", "women-rights", "harassment"],
        "timings": "Mon-Fri 10AM-6PM, Sat 10AM-2PM",
        "description": "Specializes in women's legal issues including domestic violence, harassment, and family law.",
    },
    {
        "name": "Labor Rights Collective - Mumbai",
        "address": "123 Worli, Mumbai, Maharashtra",
        "phone": "+91-22-6789-0123",
        "latitude": 19.0176,
        "longitude": 72.8194,
        "freeServices": True,
        "categories": ["labor", "workers-rights", "wage-disputes"],
        "timings": "Mon-Fri 9AM-5PM, Sat 9AM-1PM",
        "description": "NGO dedicated to protecting workers' rights, handling wage disputes and workplace harassment.",
    },
    {
        "name": "Tenant Rights Foundation - Bangalore",
        "address": "456 Park Street, Bangalore, Karnataka",
        "phone": "+91-80-2234-5678",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "freeServices": True,
        "categories": ["tenancy", "property", "eviction"],
        "timings": "Tue-Sat 11AM-7PM",
        "description": "Supports tenants in property disputes and eviction cases.",
    },
]

SAMPLE_QUERIES = [
    {
        "queryText": "My employer has not paid salary for 3 months",
        "detectedLanguage": "en",
        "legalCategoryDetected": "labor",
        "isUrgent": True,
        "isAnonymous": False,
        "aiResponse": "You can file a wage claim under labor protections and approach legal aid immediately.",
    },
    {
        "queryText": "Mera landlord mujhe ghar se nikal raha hai bina notice",
        "detectedLanguage": "hi",
        "legalCategoryDetected": "tenancy",
        "isUrgent": False,
        "isAnonymous": True,
        "aiResponse": "Bina proper notice eviction illegal ho sakta hai. Rent records collect karein.",
    },
    {
        "queryText": "Facing domestic violence and need help",
        "detectedLanguage": "en",
        "legalCategoryDetected": "domestic",
        "isUrgent": True,
        "isAnonymous": True,
        "aiResponse": "Call 181 or 100 immediately and seek protective legal assistance.",
    },
]


class DataConnectClient:
    def __init__(self) -> None:
        self.project_id = os.getenv("NEXT_PUBLIC_FIREBASE_PROJECT_ID", "").strip().strip('"')
        self.api_key = os.getenv("NEXT_PUBLIC_FIREBASE_API_KEY", "").strip().strip('"')

        dataconnect_config = self._read_file("../dataconnect/dataconnect.yaml")
        connector_config = self._read_file("../dataconnect/example/connector.yaml")

        self.location = self._extract_yaml_value(dataconnect_config, "location")
        self.service_id = self._extract_yaml_value(dataconnect_config, "serviceId")
        self.connector_id = self._extract_yaml_value(connector_config, "connectorId")

        if not self.project_id or not self.api_key:
            raise ValueError(
                "Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_API_KEY. "
                "Ensure they are in .env.local"
            )

        if not self.location or not self.service_id or not self.connector_id:
            raise ValueError("Could not read Data Connect location/service/connector from dataconnect/*.yaml")

        self.resource_name = (
            f"projects/{self.project_id}/locations/{self.location}/"
            f"services/{self.service_id}/connectors/{self.connector_id}"
        )
        self.endpoint = (
            f"https://firebasedataconnect.googleapis.com/v1/{self.resource_name}:executeMutation"
            f"?key={urllib.parse.quote(self.api_key)}"
        )

    @staticmethod
    def _read_file(path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()

    @staticmethod
    def _extract_yaml_value(content: str, key: str) -> str:
        match = re.search(rf'^{re.escape(key)}:\s*"?([^"\n]+)"?', content, re.MULTILINE)
        return match.group(1).strip() if match else ""

    def execute_mutation(self, operation_name: str, variables: dict) -> dict:
        payload = {
            "name": self.resource_name,
            "operationName": operation_name,
            "variables": variables,
        }

        req = urllib.request.Request(
            self.endpoint,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(req) as response:
                body = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            raw = e.read().decode("utf-8", errors="ignore")
            raise RuntimeError(f"HTTP {e.code}: {raw}") from e

        if body.get("errors"):
            first_error = body["errors"][0]
            message = first_error.get("message", str(first_error))
            raise RuntimeError(message)

        return body.get("data", {})


def seed_users(dc: DataConnectClient) -> None:
    print("\n👤 Seeding users into Data Connect...")
    inserted = 0

    for user in SAMPLE_USERS:
        try:
            dc.execute_mutation("CreateUser", user)
            inserted += 1
            print(f"   ✓ {user['name']}")
        except Exception as e:
            print(f"   ⚠️ Skipped user {user['uid']}: {e}")

    print(f"✅ Users inserted: {inserted}/{len(SAMPLE_USERS)}")


def seed_centers(dc: DataConnectClient) -> list:
    print("\n📍 Seeding legal aid centers into Data Connect...")
    inserted_center_ids = []

    for center in SAMPLE_CENTERS:
        try:
            data = dc.execute_mutation("CreateLegalAidCenter", center)
            center_id = (
                data.get("legalAidCenter_insert", {}).get("id")
                if isinstance(data, dict)
                else None
            )
            if center_id:
                inserted_center_ids.append(center_id)
            print(f"   ✓ {center['name']}")
        except Exception as e:
            print(f"   ⚠️ Could not insert center '{center['name']}': {e}")
            print("      Hint: Deploy latest dataconnect/example/mutations.gql first.")
            break

    print(f"✅ Center inserts attempted: {len(SAMPLE_CENTERS)}")
    return inserted_center_ids


def seed_queries(dc: DataConnectClient) -> None:
    print("\n📋 Seeding user queries into Data Connect...")
    inserted = 0

    for query in SAMPLE_QUERIES:
        try:
            dc.execute_mutation("CreateUserQuery", query)
            inserted += 1
            print(f"   ✓ {query['legalCategoryDetected']} query")
        except Exception as e:
            print(f"   ⚠️ Skipped query '{query['queryText'][:24]}...': {e}")

    print(f"✅ Queries inserted: {inserted}/{len(SAMPLE_QUERIES)}")


def seed_appointments(dc: DataConnectClient, center_ids: list) -> None:
    print("\n📅 Seeding appointments into Data Connect...")

    if not center_ids:
        print("   ⚠️ No center IDs available, skipping appointment seed.")
        return

    appointment_seed = [
        {
            "userId": None,
            "legalAidCenterId": center_ids[0],
            "userName": "Ramesh Kumar",
            "userContact": "9876543210",
            "problemSummary": "Pending wage dispute with employer.",
            "preferredDate": str(date.today() + timedelta(days=3)),
            "preferredTime": "11:00",
            "status": "pending",
        },
        {
            "userId": None,
            "legalAidCenterId": center_ids[min(1, len(center_ids) - 1)],
            "userName": "Sita Devi",
            "userContact": "9898989898",
            "problemSummary": "Domestic safety and legal consultation required.",
            "preferredDate": str(date.today() + timedelta(days=4)),
            "preferredTime": "14:30",
            "status": "pending",
        },
    ]

    inserted = 0
    for appointment in appointment_seed:
        try:
            dc.execute_mutation("CreateAppointmentWithCenter", appointment)
            inserted += 1
            print(f"   ✓ {appointment['userName']} -> {appointment['preferredDate']}")
        except Exception as e:
            print(f"   ⚠️ Skipped appointment for {appointment['userName']}: {e}")

    print(f"✅ Appointments inserted: {inserted}/{len(appointment_seed)}")


def main() -> None:
    print("\n" + "=" * 58)
    print("🌱 NyayMitra Data Connect Seeder")
    print("=" * 58)

    try:
        dc = DataConnectClient()

        print("\n🔧 Target:")
        print(f"   Project  : {dc.project_id}")
        print(f"   Location : {dc.location}")
        print(f"   Service  : {dc.service_id}")
        print(f"   Connector: {dc.connector_id}")

        seed_users(dc)
        center_ids = seed_centers(dc)
        seed_queries(dc)
        seed_appointments(dc, center_ids)

        print("\n" + "=" * 58)
        print("✅ Data Connect seeding finished")
        print("=" * 58)
        print("\nIf center insertion failed, deploy latest Data Connect operations:")
        print("   firebase deploy --only dataconnect")

    except Exception as e:
        print(f"\n❌ Error during Data Connect seeding: {e}")


if __name__ == "__main__":
    main()
