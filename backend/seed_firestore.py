#!/usr/bin/env python3
"""
Firebase Firestore Dummy Data Seeder
This script adds sample legal aid centers, queries, and other demo data to Firestore.
Run this once to populate your database for testing.
"""

import os
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Firebase
firebase_cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
if not firebase_cred_path or not os.path.exists(firebase_cred_path):
    print("❌ Error: FIREBASE_CREDENTIALS_PATH not found!")
    print("   Please ensure firebase_credentials.json is downloaded from Firebase Console")
    print("   and FIREBASE_CREDENTIALS_PATH is set in .env")
    exit(1)

try:
    cred = credentials.Certificate(firebase_cred_path)
    firebase_admin.initialize_app(cred)
except ValueError:
    print("Firebase already initialized")
except Exception as e:
    print(f"❌ Failed to initialize Firebase: {e}")
    exit(1)

db = firestore.client()

# Sample Legal Aid Centers
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
        "description": "Specializes in women's legal issues including domestic violence, harassment, and family law."
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
        "description": "NGO dedicated to protecting workers' rights, handling wage disputes, workplace harassment, and employment contracts."
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
        "description": "Supports tenants in property disputes, provides free legal consultation for eviction and rental agreement issues."
    },
    {
        "name": "Legal Aid for All - Chennai",
        "address": "789 Marina Drive, Chennai, Tamil Nadu",
        "phone": "+91-44-2847-5555",
        "latitude": 13.0499,
        "longitude": 80.2824,
        "freeServices": True,
        "categories": ["consumer", "criminal", "civil"],
        "timings": "Mon-Fri 10AM-6PM",
        "description": "Provides comprehensive free legal aid services for consumer disputes, criminal law, and general civil matters."
    },
    {
        "name": "LGBTQ+ Legal Support Network - Kolkata",
        "address": "321 Park Circus, Kolkata, West Bengal",
        "phone": "+91-33-2214-4444",
        "latitude": 22.5726,
        "longitude": 88.3639,
        "freeServices": True,
        "categories": ["lgbtq", "discrimination", "family-law"],
        "timings": "Wed-Sat 2PM-8PM, Emergency 24/7",
        "description": "Dedicated support for LGBTQ+ legal issues including discrimination, family law, and documentation changes. 24/7 emergency hotline."
    },
    {
        "name": "Senior Citizen Legal Advisor - Pune",
        "address": "654 Kalyani Nagar, Pune, Maharashtra",
        "phone": "+91-20-6789-7777",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "freeServices": True,
        "categories": ["elderly", "pension", "inheritance", "abuse"],
        "timings": "Mon-Fri 9AM-4PM",
        "description": "Specializes in legal issues affecting senior citizens including pension disputes, inheritance, and elder abuse cases."
    },
]

# Sample Queries/Cases
SAMPLE_QUERIES = [
    {
        "translated_keywords": "Workplace harassment from manager",
        "language": "en",
        "category": "labor",
        "urgency": "high",
        "isAnonymous": False,
        "created_at": datetime.utcnow() - timedelta(hours=2)
    },
    {
        "translated_keywords": "Landlord refusing to return security deposit",
        "language": "en",
        "category": "tenancy",
        "urgency": "normal",
        "isAnonymous": False,
        "created_at": datetime.utcnow() - timedelta(hours=6)
    },
    {
        "translated_keywords": "Domestic violence seeking shelter",
        "language": "hi",
        "category": "domestic",
        "urgency": "high",
        "isAnonymous": True,
        "created_at": datetime.utcnow() - timedelta(hours=1)
    },
    {
        "translated_keywords": "Wage deduction without notice",
        "language": "ta",
        "category": "labor",
        "urgency": "normal",
        "isAnonymous": False,
        "created_at": datetime.utcnow() - timedelta(days=1)
    },
    {
        "translated_keywords": "Consumer fraud - defective product not replaced",
        "language": "en",
        "category": "consumer",
        "urgency": "low",
        "isAnonymous": False,
        "created_at": datetime.utcnow() - timedelta(days=2)
    },
    {
        "translated_keywords": "Facing discrimination at workplace due to sexual orientation",
        "language": "en",
        "category": "lgbtq",
        "urgency": "high",
        "isAnonymous": True,
        "created_at": datetime.utcnow() - timedelta(days=1, hours=12)
    },
    {
        "translated_keywords": "Father refusing pension transfer after mother's death",
        "language": "mr",
        "category": "elderly",
        "urgency": "normal",
        "isAnonymous": False,
        "created_at": datetime.utcnow() - timedelta(hours=3)
    },
]

def seed_centers():
    """Add sample legal aid centers to Firestore"""
    print("\n📍 Seeding Legal Aid Centers...")
    batch = db.batch()
    
    for i, center in enumerate(SAMPLE_CENTERS):
        ref = db.collection("centers").document()
        batch.set(ref, {
            **center,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        })
        print(f"   ✓ Added: {center['name']}")
    
    batch.commit()
    print(f"✅ Added {len(SAMPLE_CENTERS)} legal aid centers")

def seed_queries():
    """Add sample queries to Firestore"""
    print("\n📋 Seeding Sample Queries...")
    batch = db.batch()
    
    for i, query in enumerate(SAMPLE_QUERIES):
        ref = db.collection("queries").document()
        batch.set(ref, query)
        print(f"   ✓ Added query: {query['category']}")
    
    batch.commit()
    print(f"✅ Added {len(SAMPLE_QUERIES)} sample queries")

def seed_categories():
    """Add legal categories reference data"""
    print("\n📚 Seeding Legal Categories...")
    categories = {
        "labor": {
            "name": "Labor & Workers' Rights",
            "description": "Workplace disputes, wage issues, contract violations",
            "helpline": "1800-11-4141"
        },
        "domestic": {
            "name": "Domestic & Family Law",
            "description": "Domestic violence, divorce, custody, inheritance",
            "helpline": "181"
        },
        "tenancy": {
            "name": "Tenancy & Property",
            "description": "Eviction, rental disputes, property rights",
            "helpline": "1800-33-5555"
        },
        "consumer": {
            "name": "Consumer Rights",
            "description": "Defective products, fraud, unfair trade practices",
            "helpline": "1800-11-4000"
        },
        "criminal": {
            "name": "Criminal Law",
            "description": "Criminal charges, bail, FIR filing",
            "helpline": "100"
        },
        "lgbtq": {
            "name": "LGBTQ+ Rights",
            "description": "Discrimination, family law, documentation",
            "helpline": "1800-77-7777"
        },
        "elderly": {
            "name": "Elderly Care & Rights",
            "description": "Pension, insurance, elder abuse, inheritance",
            "helpline": "1800-55-5555"
        },
        "women-rights": {
            "name": "Women's Rights",
            "description": "Gender discrimination, harassment, women's safety",
            "helpline": "1800-22-2222"
        },
    }
    
    for cat_id, cat_data in categories.items():
        db.collection("categories").document(cat_id).set(cat_data)
        print(f"   ✓ Added: {cat_data['name']}")
    
    print(f"✅ Added {len(categories)} legal categories")

def main():
    """Main seeding function"""
    print("\n" + "="*50)
    print("🌱 NyayMitra Firestore Seeder")
    print("="*50)
    
    try:
        # Check if data already exists
        centers_list = list(db.collection("centers").stream())
        centers_count = len(centers_list)
        if centers_count > 0:
            print(f"\n⚠️  Found {centers_count} existing centers!")
            response = input("   Do you want to clear and reseed? (yes/no): ").strip().lower()
            if response == "yes":
                print("   Clearing existing centers...")
                for doc in db.collection("centers").stream():
                    doc.reference.delete()
                for doc in db.collection("queries").stream():
                    doc.reference.delete()
                print("   ✓ Cleared")
            else:
                print("   Skipping seed. Exiting.")
                return
        
        seed_centers()
        seed_queries()
        seed_categories()
        
        print("\n" + "="*50)
        print("✅ Firestore Seeding Complete!")
        print("="*50)
        print("\n📊 Your database is now ready with:")
        print(f"   • {len(SAMPLE_CENTERS)} Legal Aid Centers")
        print(f"   • {len(SAMPLE_QUERIES)} Sample Queries")
        print(f"   • 8 Legal Categories")
        print("\n🚀 You can now run the app and see live data!")
        
    except Exception as e:
        print(f"\n❌ Error during seeding: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
