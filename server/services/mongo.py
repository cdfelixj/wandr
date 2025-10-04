from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
if not MONGO_URI:
    MONGO_URI = "mongodb://localhost:27017"
client = MongoClient(MONGO_URI)
db = client["sidequest_db"]  # one DB for everything

# Collections
user_profiles_col = db["user_profiles"]  # used app-wide
activities_col = db["activities"]        # optional Sidequest cache