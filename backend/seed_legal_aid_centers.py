#!/usr/bin/env python3
"""
Seed a broad legal aid center catalog into Firestore.

The live app reads centers from the backend Firestore collection, so this script
populates the same source of truth used by the UI.
"""

import datetime
import os
from typing import Any

import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()
load_dotenv("../.env.local")
load_dotenv("../.env")


LEGAL_AID_CENTERS: list[dict[str, Any]] = [
    {
        "name": "District Legal Services Authority - Mumbai City",
        "address": "City Civil Court Compound, Fort, Mumbai, Maharashtra",
        "phone": "+91-22-2263-1234",
        "lat": 18.9418,
        "lng": 72.8347,
        "latitude": 18.9418,
        "longitude": 72.8347,
        "categories": ["all", "emergency", "family", "domestic", "women-rights", "consumer", "labor", "tenancy"],
        "services": ["free legal advice", "court filing help", "mediation", "referrals"],
        "languages": ["en", "hi", "mr"],
        "timings": "Mon-Sat 10AM-5PM",
        "description": "Primary legal aid desk for urgent civil, family, and worker disputes.",
        "freeServices": True,
        "emergency": True,
        "priority": 100,
        "contactPerson": "DLSA Duty Officer",
        "helpline": "15100",
        "documents": ["ID proof", "income proof", "case papers"],
    },
    {
        "name": "State Women Legal Aid Cell - Delhi",
        "address": "Patiala House Courts, New Delhi",
        "phone": "+91-11-2338-9001",
        "lat": 28.6142,
        "lng": 77.1997,
        "latitude": 28.6142,
        "longitude": 77.1997,
        "categories": ["emergency", "domestic", "women-rights", "harassment", "sexual-harassment", "family"],
        "services": ["protection orders", "police liaison", "counselling", "legal drafting"],
        "languages": ["en", "hi"],
        "timings": "24x7 emergency intake; desk Mon-Fri 9AM-6PM",
        "description": "Fast-track support for domestic violence, harassment, and protection matters.",
        "freeServices": True,
        "emergency": True,
        "priority": 95,
        "contactPerson": "Emergency Response Cell",
        "helpline": "181",
        "documents": ["medical records", "police complaint", "photos", "IDs"],
    },
    {
        "name": "Emergency Police-Legal Liaison Desk - Nagpur",
        "address": "Nagpur District Court Annex, Maharashtra",
        "phone": "+91-712-255-0011",
        "lat": 21.1458,
        "lng": 79.0882,
        "latitude": 21.1458,
        "longitude": 79.0882,
        "categories": ["emergency", "domestic", "criminal", "harassment", "women-rights"],
        "services": ["immediate complaint drafting", "FIR help", "safe referral"],
        "languages": ["en", "hi", "mr"],
        "timings": "24x7 emergency desk",
        "description": "Urgent legal support for violence, threats, and high-risk safety cases.",
        "freeServices": True,
        "emergency": True,
        "priority": 99,
        "contactPerson": "Duty Magistrate Support",
        "helpline": "100",
        "documents": ["incident details", "photos", "medical report", "ID"],
    },
    {
        "name": "Cyber Crime and Digital Safety Desk - Hyderabad",
        "address": "City Civil Courts, Hyderabad, Telangana",
        "phone": "+91-40-2331-2200",
        "lat": 17.3850,
        "lng": 78.4867,
        "latitude": 17.3850,
        "longitude": 78.4867,
        "categories": ["cyber", "online-fraud", "harassment", "privacy"],
        "services": ["data theft response", "account recovery help", "evidence preservation"],
        "languages": ["en", "hi", "te"],
        "timings": "24x7 helpline; desk Mon-Fri 9AM-6PM",
        "description": "Helpline and legal aid for cyber harassment, fraud, and account compromise.",
        "freeServices": True,
        "emergency": True,
        "priority": 90,
        "contactPerson": "Cyber Response Officer",
        "helpline": "1930",
        "documents": ["screenshots", "transaction IDs", "emails"],
    },
    {
        "name": "Child Rights Support Unit - Chennai",
        "address": "Egmore Court Campus, Chennai, Tamil Nadu",
        "phone": "+91-44-2819-4411",
        "lat": 13.0827,
        "lng": 80.2707,
        "latitude": 13.0827,
        "longitude": 80.2707,
        "categories": ["child-rights", "family", "education", "posco"],
        "services": ["child protection", "school access disputes", "welfare referrals"],
        "languages": ["en", "hi", "ta"],
        "timings": "Mon-Sat 10AM-5PM",
        "description": "Support for child protection, education, and welfare matters.",
        "freeServices": True,
        "emergency": True,
        "priority": 88,
        "contactPerson": "Child Protection Desk",
        "documents": ["birth certificate", "school records", "guardian ID"],
    },
    {
        "name": "Workers Rights Legal Aid Center - Pune",
        "address": "Shivajinagar Court Road, Pune, Maharashtra",
        "phone": "+91-20-2553-1204",
        "lat": 18.5204,
        "lng": 73.8567,
        "latitude": 18.5204,
        "longitude": 73.8567,
        "categories": ["labor", "wage-disputes", "workers-rights", "industrial-relations"],
        "services": ["salary claims", "termination notices", "bonus disputes", "settlements"],
        "languages": ["en", "hi", "mr"],
        "timings": "Mon-Fri 10AM-5PM",
        "description": "For unpaid salary, wrongful termination, and workplace rights issues.",
        "freeServices": True,
        "emergency": False,
        "priority": 80,
        "contactPerson": "Labor Panel Lawyer",
        "helpline": "1800-120-0120",
        "documents": ["salary slips", "appointment letter", "messages", "attendance"],
    },
    {
        "name": "Tenant and Eviction Support Desk - Bengaluru",
        "address": "Civic Court Complex, Bengaluru, Karnataka",
        "phone": "+91-80-2211-7788",
        "lat": 12.9716,
        "lng": 77.5946,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "categories": ["tenancy", "property", "eviction", "rent-dispute"],
        "services": ["notice review", "rent agreement review", "eviction defense"],
        "languages": ["en", "kn"],
        "timings": "Tue-Sat 11AM-6PM",
        "description": "Supports tenants in property disputes, eviction notices, and deposit claims.",
        "freeServices": True,
        "emergency": False,
        "priority": 72,
        "contactPerson": "Tenancy Desk",
        "documents": ["rent agreement", "notice copy", "payment receipts"],
    },
    {
        "name": "Consumer Complaints Help Center - Kolkata",
        "address": "BBD Bagh Court Area, Kolkata, West Bengal",
        "phone": "+91-33-2210-3344",
        "lat": 22.5726,
        "lng": 88.3639,
        "latitude": 22.5726,
        "longitude": 88.3639,
        "categories": ["consumer", "online-fraud", "refund", "service-deficiency"],
        "services": ["consumer notices", "refund claims", "e-commerce disputes"],
        "languages": ["en", "hi", "bn"],
        "timings": "Mon-Sat 10AM-4PM",
        "description": "For faulty goods, refund disputes, and online fraud complaints.",
        "freeServices": True,
        "emergency": False,
        "priority": 60,
        "contactPerson": "Consumer Counsel",
        "documents": ["invoice", "screenshots", "delivery receipts"],
    },
    {
        "name": "Family & Maintenance Legal Aid - Ahmedabad",
        "address": "District Court Road, Ahmedabad, Gujarat",
        "phone": "+91-79-2754-8822",
        "lat": 23.0225,
        "lng": 72.5714,
        "latitude": 23.0225,
        "longitude": 72.5714,
        "categories": ["family", "marriage", "maintenance", "custody"],
        "services": ["maintenance petitions", "custody advice", "marriage disputes"],
        "languages": ["en", "hi", "gu"],
        "timings": "Mon-Fri 10AM-5PM",
        "description": "Family dispute, maintenance, and child custody consultation center.",
        "freeServices": True,
        "emergency": False,
        "priority": 55,
        "contactPerson": "Family Court Liaison",
        "documents": ["marriage certificate", "birth certificates", "bank records"],
    },
    {
        "name": "Land and Revenue Legal Clinic - Jaipur",
        "address": "Rajasthan High Court Area, Jaipur, Rajasthan",
        "phone": "+91-141-222-3300",
        "lat": 26.9124,
        "lng": 75.7873,
        "latitude": 26.9124,
        "longitude": 75.7873,
        "categories": ["land", "property", "mutation", "revenue"],
        "services": ["title review", "mutation disputes", "land records support"],
        "languages": ["en", "hi", "ra"],
        "timings": "Mon-Sat 10AM-5PM",
        "description": "Land ownership, record correction, and revenue dispute assistance.",
        "freeServices": True,
        "emergency": False,
        "priority": 52,
        "contactPerson": "Revenue Panel",
        "documents": ["7/12 extract", "sale deed", "mutation records"],
    },
    {
        "name": "Senior Citizen and Pension Help Desk - Lucknow",
        "address": "District Magistrate Court Road, Lucknow, Uttar Pradesh",
        "phone": "+91-522-223-7781",
        "lat": 26.8467,
        "lng": 80.9462,
        "latitude": 26.8467,
        "longitude": 80.9462,
        "categories": ["senior-citizen", "pension", "maintenance", "family"],
        "services": ["pension problems", "maintenance support", "property settlement guidance"],
        "languages": ["en", "hi"],
        "timings": "Mon-Fri 10AM-4PM",
        "description": "Dedicated help for senior citizens, pension disputes, and maintenance claims.",
        "freeServices": True,
        "emergency": False,
        "priority": 58,
        "contactPerson": "Senior Aid Officer",
        "documents": ["pension passbook", "Aadhaar", "bank statement"],
    },
    {
        "name": "Migrant and Disability Rights Support - Kochi",
        "address": "High Court Junction, Kochi, Kerala",
        "phone": "+91-484-230-9911",
        "lat": 9.9312,
        "lng": 76.2673,
        "latitude": 9.9312,
        "longitude": 76.2673,
        "categories": ["disability", "migrant-workers", "labor", "accessibility"],
        "services": ["accessibility claims", "migrant worker support", "welfare access"],
        "languages": ["en", "hi", "ml"],
        "timings": "Mon-Sat 10AM-5PM",
        "description": "Support for disability rights, migrant workers, and workplace access issues.",
        "freeServices": True,
        "emergency": False,
        "priority": 65,
        "contactPerson": "Inclusion Advocate",
        "documents": ["disability certificate", "work contract", "travel papers"],
    },
]


def initialize_firestore() -> None:
    credentials_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    if credentials_path and os.path.exists(credentials_path):
        firebase_admin.initialize_app(credentials.Certificate(credentials_path))
        return

    try:
        firebase_admin.initialize_app()
    except ValueError:
        pass


def seed_centers() -> None:
    initialize_firestore()
    db = firestore.client()
    batch = db.batch()

    for index, center in enumerate(LEGAL_AID_CENTERS):
        doc_id = center["name"].lower().replace(" ", "-").replace("/", "-")[:96]
        payload = dict(center)
        payload["created_at"] = datetime.datetime.utcnow()
        payload["updated_at"] = datetime.datetime.utcnow()
        batch.set(db.collection("centers").document(doc_id), payload, merge=True)

        if (index + 1) % 400 == 0:
            batch.commit()
            batch = db.batch()

    batch.commit()
    print(f"Seeded {len(LEGAL_AID_CENTERS)} legal aid centers into Firestore collection 'centers'.")


if __name__ == "__main__":
    seed_centers()