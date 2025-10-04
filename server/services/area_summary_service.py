"""
Area Summary Service - Generates comprehensive summaries of geographic areas
Combines Google Places API data with OpenAI to create engaging area descriptions
"""
import os
import json
import requests
from typing import Dict, List, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv
from services.activity_service import get_city_from_latlon

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_CLOUD_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI client
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

class AreaSummaryService:
    """Service for generating comprehensive area summaries"""
    
    def __init__(self):
        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_CLOUD_API_KEY environment variable is required")
        if not openai_client:
            raise ValueError("OPENAI_API_KEY environment variable is required")
    
    async def get_area_summary(self, lat: float, lon: float, radius: int = 2000) -> Dict[str, Any]:
        """
        Generate a comprehensive summary of an area within the specified radius
        
        Args:
            lat: Latitude coordinate
            lon: Longitude coordinate  
            radius: Search radius in meters (default 2000m = 2km)
            
        Returns:
            Dictionary containing area summary data
        """
        try:
            print(f"[Area Summary] Generating summary for ({lat}, {lon}) within {radius}m")
            
            # Get basic location information
            city_info = await self._get_location_context(lat, lon)
            
            # Fetch nearby places from Google Places API
            places_data = await self._fetch_nearby_places(lat, lon, radius)
            
            # Get popular times and busyness data
            busyness_data = await self._analyze_area_busyness(places_data)
            
            # Generate AI-powered area description
            ai_summary = await self._generate_ai_summary(lat, lon, city_info, places_data, busyness_data)
            
            # Compile final summary
            area_summary = {
                "coordinates": {"lat": lat, "lon": lon},
                "radius": radius,
                "location_context": city_info,
                "places": places_data,
                "busyness": busyness_data,
                "ai_summary": ai_summary,
                "recommendations": await self._get_recommendations(places_data),
                "area_characteristics": await self._analyze_area_characteristics(places_data)
            }
            
            print(f"[Area Summary] Successfully generated summary with {len(places_data)} places")
            return area_summary
            
        except Exception as e:
            print(f"[Area Summary] Error generating summary: {str(e)}")
            return {"error": f"Failed to generate area summary: {str(e)}"}
    
    async def _get_location_context(self, lat: float, lon: float) -> Dict[str, Any]:
        """Get basic location context using reverse geocoding"""
        try:
            url = f"https://maps.googleapis.com/maps/api/geocode/json"
            params = {
                "latlng": f"{lat},{lon}",
                "key": GOOGLE_API_KEY
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if not data.get("results"):
                return {"city": "Unknown", "neighborhood": "Unknown", "formatted_address": "Unknown"}
            
            result = data["results"][0]
            formatted_address = result.get("formatted_address", "Unknown")
            
            # Extract city and neighborhood from components
            city = "Unknown"
            neighborhood = "Unknown"
            
            for component in result.get("address_components", []):
                types = component.get("types", [])
                if "locality" in types:
                    city = component["long_name"]
                elif "sublocality" in types or "neighborhood" in types:
                    neighborhood = component["long_name"]
            
            return {
                "city": city,
                "neighborhood": neighborhood,
                "formatted_address": formatted_address
            }
            
        except Exception as e:
            print(f"[Area Summary] Error getting location context: {e}")
            return {"city": "Unknown", "neighborhood": "Unknown", "formatted_address": "Unknown"}
    
    async def _fetch_nearby_places(self, lat: float, lon: float, radius: int) -> List[Dict[str, Any]]:
        """Fetch nearby places using Google Places API"""
        try:
            url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
            params = {
                "location": f"{lat},{lon}",
                "radius": radius,
                "key": GOOGLE_API_KEY
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            places = []
            for place in data.get("results", [])[:20]:  # Limit to top 20 places
                place_info = {
                    "place_id": place.get("place_id"),
                    "name": place.get("name"),
                    "types": place.get("types", []),
                    "rating": place.get("rating") if place.get("rating") is not None else 0,
                    "user_ratings_total": place.get("user_ratings_total") if place.get("user_ratings_total") is not None else 0,
                    "price_level": place.get("price_level"),
                    "vicinity": place.get("vicinity"),
                    "geometry": place.get("geometry", {}).get("location"),
                    "business_status": place.get("business_status"),
                    "opening_hours": place.get("opening_hours"),
                }
                
                # Only add places with basic required info
                if place_info["name"]:
                    places.append(place_info)
            
            return places
            
        except Exception as e:
            print(f"[Area Summary] Error fetching nearby places: {e}")
            return []
    
    async def _analyze_area_busyness(self, places_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze area busyness based on places data"""
        try:
            total_places = len(places_data)
            if total_places == 0:
                return {"level": "unknown", "description": "No data available"}
            
            # Analyze based on number of ratings and place types
            high_traffic_types = ["restaurant", "tourist_attraction", "shopping_mall", "transit_station"]
            busy_places = 0
            total_ratings = 0
            
            for place in places_data:
                ratings_count = place.get("user_ratings_total") or 0
                types = place.get("types", [])
                
                # Only add if ratings_count is not None and is a number
                if ratings_count is not None and isinstance(ratings_count, (int, float)):
                    total_ratings += int(ratings_count)
                
                # Check if it's a high-traffic type
                if any(t in high_traffic_types for t in types):
                    busy_places += 1
            
            avg_ratings = total_ratings / total_places if total_places > 0 else 0
            busy_ratio = busy_places / total_places if total_places > 0 else 0
            
            # Determine busyness level
            if avg_ratings > 500 and busy_ratio > 0.3:
                level = "very_busy"
                description = "This is a very busy area with high foot traffic and many popular destinations"
            elif avg_ratings > 200 or busy_ratio > 0.2:
                level = "moderately_busy"
                description = "This area has moderate activity with several popular spots"
            elif avg_ratings > 50:
                level = "quiet"
                description = "This is a relatively quiet area with some local establishments"
            else:
                level = "very_quiet"
                description = "This is a very quiet area with minimal commercial activity"
            
            return {
                "level": level,
                "description": description,
                "metrics": {
                    "total_places": total_places,
                    "avg_ratings_count": int(avg_ratings),
                    "busy_places_ratio": round(busy_ratio, 2)
                }
            }
            
        except Exception as e:
            print(f"[Area Summary] Error analyzing busyness: {e}")
            return {"level": "unknown", "description": "Could not analyze area busyness"}
    
    async def _get_recommendations(self, places_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Get top recommendations from the area"""
        try:
            # Sort places by rating and popularity
            scored_places = []
            for place in places_data:
                rating = place.get("rating") or 0
                ratings_count = place.get("user_ratings_total") or 0
                
                # Ensure both values are numbers
                if not isinstance(rating, (int, float)):
                    rating = 0
                if not isinstance(ratings_count, (int, float)):
                    ratings_count = 0
                
                # Calculate score based on rating and popularity
                score = float(rating) * (1 + min(float(ratings_count) / 100, 5))  # Cap popularity boost
                
                scored_places.append({
                    **place,
                    "recommendation_score": score
                })
            
            # Sort by score and return top recommendations
            top_places = sorted(scored_places, key=lambda x: x.get("recommendation_score", 0), reverse=True)[:8]
            
            recommendations = []
            for place in top_places:
                name = place.get("name")
                rating = place.get("rating")
                
                # Only include places with names and valid ratings
                if name and rating is not None and isinstance(rating, (int, float)) and float(rating) > 0:
                    recommendations.append({
                        "name": name,
                        "types": place.get("types", []),
                        "rating": float(rating),
                        "ratings_count": place.get("user_ratings_total"),
                        "price_level": place.get("price_level"),
                        "vicinity": place.get("vicinity"),
                        "recommendation_reason": self._get_recommendation_reason(place)
                    })
            
            return recommendations
            
        except Exception as e:
            print(f"[Area Summary] Error getting recommendations: {e}")
            return []
    
    def _get_recommendation_reason(self, place: Dict[str, Any]) -> str:
        """Generate a recommendation reason for a place"""
        rating = place.get("rating") or 0
        ratings_count = place.get("user_ratings_total") or 0
        types = place.get("types", [])
        
        # Ensure values are numbers
        if not isinstance(rating, (int, float)):
            rating = 0
        if not isinstance(ratings_count, (int, float)):
            ratings_count = 0
            
        rating = float(rating)
        ratings_count = int(ratings_count)
        
        if rating >= 4.5 and ratings_count >= 100:
            return "Highly rated with many positive reviews"
        elif rating >= 4.0 and ratings_count >= 50:
            return "Well-reviewed local favorite"
        elif "tourist_attraction" in types:
            return "Popular attraction worth visiting"
        elif "restaurant" in types and rating >= 4.0:
            return "Great dining option"
        else:
            return "Noteworthy local spot"
    
    async def _analyze_area_characteristics(self, places_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze the characteristics of the area"""
        try:
            type_counts = {}
            total_places = len(places_data)
            
            for place in places_data:
                for place_type in place.get("types", []):
                    type_counts[place_type] = type_counts.get(place_type, 0) + 1
            
            # Determine primary characteristics
            characteristics = []
            
            if type_counts.get("restaurant", 0) >= 3:
                characteristics.append("dining")
            if type_counts.get("store", 0) + type_counts.get("shopping_mall", 0) >= 2:
                characteristics.append("shopping")
            if type_counts.get("tourist_attraction", 0) >= 1:
                characteristics.append("tourist")
            if type_counts.get("lodging", 0) >= 2:
                characteristics.append("hospitality")
            if type_counts.get("transit_station", 0) >= 1:
                characteristics.append("transit_hub")
            if type_counts.get("park", 0) + type_counts.get("natural_feature", 0) >= 1:
                characteristics.append("nature")
            
            # Determine area vibe
            if "restaurant" in type_counts and "night_club" in type_counts:
                vibe = "nightlife"
            elif sum(1 for t in type_counts if "entertainment" in t or "amusement" in t) >= 2:
                vibe = "entertainment"
            elif "shopping_mall" in type_counts or type_counts.get("store", 0) >= 3:
                vibe = "commercial"
            elif type_counts.get("tourist_attraction", 0) >= 2:
                vibe = "tourist"
            elif type_counts.get("park", 0) >= 1:
                vibe = "recreational"
            else:
                vibe = "mixed_use"
            
            return {
                "primary_characteristics": characteristics,
                "area_vibe": vibe,
                "place_type_distribution": dict(list(sorted(type_counts.items(), key=lambda x: x[1], reverse=True))[:10])
            }
            
        except Exception as e:
            print(f"[Area Summary] Error analyzing characteristics: {e}")
            return {"primary_characteristics": [], "area_vibe": "unknown"}
    
    async def _generate_ai_summary(self, lat: float, lon: float, city_info: Dict, places_data: List[Dict], busyness_data: Dict) -> Dict[str, str]:
        """Generate AI-powered summary using OpenAI"""
        try:
            if not openai_client:
                return {"error": "OpenAI client not available"}
            
            # Prepare context for AI
            # Build location name intelligently - only include parts that are not "Unknown"
            neighborhood = city_info.get('neighborhood', '')
            city = city_info.get('city', '')
            
            # Filter out "Unknown" values
            location_parts = []
            if neighborhood and neighborhood != "Unknown":
                location_parts.append(neighborhood)
            if city and city != "Unknown":
                location_parts.append(city)
            
            # Build the location name
            if len(location_parts) == 2:
                location_name = f"{location_parts[0]} in {location_parts[1]}"
            elif len(location_parts) == 1:
                location_name = location_parts[0]
            else:
                location_name = "this area"
            
            place_types = []
            notable_places = []
            
            for place in places_data[:10]:  # Top 10 places
                name = place.get("name")
                rating = place.get("rating")
                
                # Only include places with valid names and ratings
                if name and rating is not None and isinstance(rating, (int, float)) and float(rating) >= 4.0:
                    notable_places.append(f"{name} ({rating} stars)")
                place_types.extend(place.get("types", []))
            
            # Count common types
            type_counts = {}
            for ptype in place_types:
                type_counts[ptype] = type_counts.get(ptype, 0) + 1
            
            common_types = [t for t, c in sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
            
            prompt = f"""
            You are a straightforward, honest local guide providing a realistic assessment of {location_name}. 
            Be frank and authentic - if an area is quiet or unremarkable, say so. Don't oversell or be promotional.
            
            Context:
            - Location: {location_name}
            - Coordinates: ({lat}, {lon})
            - Area busyness: {busyness_data.get('description', 'Unknown')}
            - Common place types: {', '.join(common_types)}
            - Notable places: {', '.join(notable_places[:5])}
            
            Please provide an honest, realistic summary covering:
            1. What this area is actually known for - be specific about landmarks, historical sites, or famous tourist destinations if any exist. If it's just a regular neighborhood, say that.
            2. Brief history or interesting facts about notable landmarks, historical events, or famous buildings/sites in the area. Skip generic history.
            3. What visitors will realistically find here - focus on actual attractions, landmarks, or noteworthy destinations. Don't pad with generic businesses.
            4. The genuine atmosphere - is it touristy, residential, commercial, boring, vibrant? Be honest.
            5. If lets say an area is a tourist hub like Lan Kwai Fong, a Nightlife hub, mention that. If it's a quiet residential area with no attractions, say that too.
            
            Prioritize mentioning:
            - Famous landmarks, monuments, or iconic buildings
            - Historical sites or areas of cultural significance  
            - Well-known tourist attractions or destinations
            - Notable architecture or urban features
            
            If the area lacks notable landmarks or attractions, be honest about it being a regular neighborhood. 
            Don't manufacture excitement. Keep the total response under 200 words and be genuine.
            """
            
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.7
            )
            
            ai_text = response.choices[0].message.content.strip()
            
            return {
                "full_summary": ai_text,
                "location_name": location_name
            }
            
        except Exception as e:
            print(f"[Area Summary] Error generating AI summary: {e}")
            
            # Build location name for error case - same logic as above
            neighborhood = city_info.get('neighborhood', '')
            city = city_info.get('city', '')
            
            location_parts = []
            if neighborhood and neighborhood != "Unknown":
                location_parts.append(neighborhood)
            if city and city != "Unknown":
                location_parts.append(city)
            
            if len(location_parts) == 2:
                error_location_name = f"{location_parts[0]} in {location_parts[1]}"
            elif len(location_parts) == 1:
                error_location_name = location_parts[0]
            else:
                error_location_name = "This area"
            
            return {
                "error": f"Could not generate AI summary: {str(e)}",
                "location_name": error_location_name
            }

# Convenience function for easy integration
async def get_area_summary(lat: float, lon: float, radius: int = 2000) -> Dict[str, Any]:
    """
    Generate area summary for given coordinates
    """
    service = AreaSummaryService()
    return await service.get_area_summary(lat, lon, radius)
