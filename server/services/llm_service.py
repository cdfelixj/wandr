from google import genai
import os
import json
import re
from services.mongodb_service import mongodb_service


def _get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set.")
    return genai.Client(api_key=api_key)


def _get_user_keywords(user_id: str) -> dict:
    """
    Get user context including preferences and keywords from MongoDB
    """
    if not user_id:
        print(f"[LLM] No user_id provided")
        return {}
    
    try:
        print(f"[LLM] Looking up user profile for auth0_user_id: {user_id}")
        # Use auth0_user_id as the field name for the lookup
        profile = mongodb_service.get_user_profile_by_auth0_id(user_id)
        
        # Debug: Print the complete profile data
        print(f"[LLM] Complete user profile from MongoDB: {profile}")
        
        if not profile:
            print(f"[LLM] No profile found for auth0_user_id: {user_id}")
            return {}
        
        keywords = profile.get("keywords", {})
        print(f"[LLM] Extracted keywords: {keywords}")
        
        return {
            "keywords": keywords,
        }
    except Exception as e:
        print(f"Error getting user context: {e}")
        return {}


def _resolve_personalized_locations(text: str, user_context: dict) -> str:
    """
    Replace personalized keywords with actual addresses from user preferences
    Keywords format: {"home": "Society 145", "work": "51 Breithaupt St, Kitchener, ON", ...}
    """
    keywords = user_context.get("keywords", {})
    
    if not keywords:
        print("[LLM] No keywords found for user")
        return text
    
    print(f"[LLM] Available keywords: {list(keywords.keys())}")
    
    resolved_text = text
    
    for keyword, address in keywords.items():
        keyword_lower = keyword.lower()
        
        # Check if keyword appears in the text (case-insensitive)
        if keyword_lower in text.lower():
            # Replace the keyword with the actual address
            resolved_text = re.sub(
                re.escape(keyword), 
                str(address), 
                resolved_text, 
                flags=re.IGNORECASE
            )
            
            print(f"[LLM] Resolved '{keyword}' to '{address}'")
    
    return resolved_text


def parse_intent(starting_location: str, text: str, user_id: str = None) -> dict:
    """
    Use Gemini to parse user intent from transcribed text with keyword resolution.
    """
    print(f"[LLM] parse_intent called with user_id: {user_id}")
    print(f"[LLM] Original text: '{text}'")
    
    # Get user context and resolve personalized locations
    user_context = _get_user_keywords(user_id) if user_id else {}
    resolved_text = _resolve_personalized_locations(text, user_context)
    
    print(f"[LLM] Resolved text: '{resolved_text}'")
    
    # Add available keywords to system rules for better understanding
    keywords_info = ""
    if user_context.get("keywords"):
        keywords_list = list(user_context["keywords"].keys())
        keywords_info = f"\nUser has these personalized location keywords: {', '.join(keywords_list)}"
        print(f"[LLM] Keywords available: {keywords_list}")
    
    system_rules = (
        "Parse route intent. Return JSON with 3 keys:\n"
        "1) place_types: array of search terms (specific names or categories)\n"
        "2) last_destination: final stop name\n"
        "3) search_radius_meters: radius from start (default 10000)\n"
        "Prioritize specific locations over general categories."
    )

    prompt = (
        f"{system_rules}{keywords_info}\nStart: {starting_location}\nText: {resolved_text}"
    )

    client = _get_gemini_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "temperature": 0.1,  # Lower temperature = faster + more consistent
        },
    )

    print(f"[LLM] Gemini response: {response.text}")

    # Parse the JSON string response into a Python dict
    intent_data = json.loads(response.text)
    return intent_data


def select_stops(intent: dict, candidates: list, user_id: str = None) -> list:
    """
    Use Gemini to select and rank stops from candidate places based on user intent.

    Args:
        intent: Parsed intent dictionary from parse_intent()
        candidates: List of candidate places from Google Places API
        user_id: User's Auth0 ID for accessing personalized preferences
    Returns:
        list: Selected and ranked stops as a list of place dictionaries
    """
    # Get user context for personalized recommendations
    user_context = _get_user_keywords(user_id) if user_id else {}
    
        # Concise system rules (83% fewer tokens = faster response!)
    system_rules = (
        "Select ONE place per category from intent place_types. Return JSON array sorted by visit order.\n"
        "Priorities: 1) User intent match 2) Proximity 3) Rating\n"
        "Last place must match intent last_destination."
    )

    # Convert PlaceCandidate objects to dictionaries if needed
    candidates_dict = []
    for candidate in candidates:
        if hasattr(candidate, "__dict__"):
            # Convert Pydantic model to dict
            candidates_dict.append(
                candidate.dict() if hasattr(candidate, "dict") else candidate.__dict__
            )
        else:
            # Already a dictionary
            candidates_dict.append(candidate)

    # Limit to top 20 candidates to reduce tokens (66% fewer tokens = faster!)
    top_candidates = candidates_dict[:20] if len(candidates_dict) > 20 else candidates_dict
    
    print(f"[LLM] Sending {len(top_candidates)} candidates to Gemini (limited from {len(candidates_dict)})")

    prompt = f"{system_rules}\nIntent: {json.dumps(intent)}\nPlaces: {json.dumps(top_candidates)}"

    client = _get_gemini_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "temperature": 0.1,  # Lower temperature = faster + more consistent
        },
    )

    print(f"Gemini raw response for select_stops: {response.text}")

    # Parse the JSON string response into a Python list
    stops = json.loads(response.text)
    return stops


if __name__ == "__main__":
    sample_starting_location = "University of Waterloo"
    sample_text = "I want to go to a coffee shop and then visit a museum."
    intent = parse_intent(sample_starting_location, sample_text)
    print("Parsed Intent:", intent)
