import os
import json
import math
import re
from datetime import datetime
from typing import Optional, Dict, Any, List

import numpy as np
import pygeohash as pgh
from catboost import CatBoostRegressor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import sys
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
ML_MODEL_DIR = os.path.join(ROOT_DIR, "ml_model")

if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if ML_MODEL_DIR not in sys.path:
    sys.path.insert(0, ML_MODEL_DIR)

# Load or train model
from train_or_init import train_or_initialize_model, MODEL_PATH, GEOHASHES_PATH

# Ensure model and geohashes are initialized
train_or_initialize_model()

# Load simple dotenv
env_path = os.path.join(BASE_DIR, ".env")
if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if '=' in line and not line.strip().startswith('#'):
                k, v = line.strip().split('=', 1)
                # Remove spaces and quotes if the user added them in .env
                os.environ[k.strip()] = v.strip().strip('"').strip("'")

app = FastAPI(
    title="ParkSight AI - CatBoost Parking Violation Prediction Service",
    description="5-feature Spatiotemporal Poisson Regressor for Smart Parking Hotspot Forecasting",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite runs on port 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Model & Geohash state
def resolve_file(fname):
    for candidate in [os.path.join(ML_MODEL_DIR, fname), os.path.join(ROOT_DIR, fname), os.path.join(BASE_DIR, fname), fname]:
        if os.path.exists(candidate):
            return candidate
    return os.path.join(ML_MODEL_DIR, fname)

actual_model_path = resolve_file(MODEL_PATH)
actual_geohash_path = resolve_file(GEOHASHES_PATH)

model = CatBoostRegressor()
model.load_model(actual_model_path)

top_geohashes: List[str] = []
if os.path.exists(actual_geohash_path):
    with open(actual_geohash_path, 'r') as f:
        top_geohashes = json.load(f)

top_geohashes_set = set(top_geohashes)
default_geohash = top_geohashes[0] if top_geohashes else "tdr1v9q"

# Pre-cache decoded coordinates for instant nearest-neighbor matching
decoded_top_geohashes = []
for gh in top_geohashes:
    try:
        glat, glng = pgh.decode(gh)
        decoded_top_geohashes.append((gh, glat, glng))
    except Exception:
        pass


class PredictionRequest(BaseModel):
    latitude: float = Field(..., description="GPS Latitude in decimal degrees (e.g. 12.9716)")
    longitude: float = Field(..., description="GPS Longitude in decimal degrees (e.g. 77.5946)")
    date: str = Field(..., description="Date string (e.g. '2026-09-17' or ISO format)")
    time: Optional[str] = Field("06:00 PM", description="Time string (e.g. '06:00 PM', '18:00', or 24h)")
    hour: Optional[int] = Field(None, description="Direct hour integer 0-23 (optional override)")


class PredictionResponse(BaseModel):
    violations_per_hour: float
    risk_level: str
    risk_category: str
    geohash: str
    latitude: float
    longitude: float
    date: str
    day_name: str
    time: str
    hour: int
    features_used: Dict[str, Any]
    is_known_hotspot: bool
    nearest_hotspot_geohash: Optional[str]
    message: str
    weather_condition: Optional[str] = None
    weather_multiplier: Optional[float] = None


def parse_hour(time_str: Optional[str], direct_hour: Optional[int]) -> int:
    """Extract hour integer (0-23) from time string or direct hour input."""
    if direct_hour is not None and 0 <= direct_hour <= 23:
        return direct_hour
    
    if not time_str:
        return 18

    # Match 12-hour format e.g. "06:00 PM", "6:30 AM", "6 PM"
    m_12 = re.search(r'(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?', time_str, re.IGNORECASE)
    if m_12:
        h = int(m_12.group(1))
        meridiem = m_12.group(3)
        if meridiem:
            meridiem = meridiem.upper()
            if meridiem == 'PM' and h < 12:
                h += 12
            elif meridiem == 'AM' and h == 12:
                h = 0
        return min(23, max(0, h))

    return 18


def parse_day_of_week(date_str: str) -> tuple[int, str]:
    """Extract day of week (0=Monday, 6=Sunday) and day name from date string."""
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    try:
        # Try ISO / YYYY-MM-DD
        dt = datetime.fromisoformat(date_str.replace('Z', ''))
        return dt.weekday(), day_names[dt.weekday()]
    except Exception:
        pass

    # Try common formats
    for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%d %b %Y", "%d %B %Y"]:
        try:
            dt = datetime.strptime(date_str.split('(')[0].strip(), fmt)
            return dt.weekday(), day_names[dt.weekday()]
        except Exception:
            continue

    # Default to current weekday
    now = datetime.now()
    return now.weekday(), day_names[now.weekday()]


def find_closest_known_geohash(target_lat: float, target_lng: float) -> str:
    """Finds the geographically closest geohash from trained top_geohashes."""
    if not decoded_top_geohashes:
        return default_geohash

    best_gh = default_geohash
    min_dist_sq = float('inf')

    for gh, glat, glng in decoded_top_geohashes:
        d2 = (glat - target_lat)**2 + (glng - target_lng)**2
        if d2 < min_dist_sq:
            min_dist_sq = d2
            best_gh = gh

    return best_gh


@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "model": "CatBoost Poisson Regressor",
        "model_file": MODEL_PATH,
        "features": ["geohash", "hour_sin", "hour_cos", "day_sin", "day_cos"],
        "geohash_precision": 7,
        "trained_hotspots_count": len(top_geohashes),
    }


@app.post("/api/predict", response_model=PredictionResponse)
def predict_violations(req: PredictionRequest):
    # 1. Encode Geohash (Precision 7 / ~150m radius)
    raw_geohash = pgh.encode(req.latitude, req.longitude, precision=7)
    
    is_known = raw_geohash in top_geohashes_set
    effective_geohash = raw_geohash if is_known else find_closest_known_geohash(req.latitude, req.longitude)

    # 2. Extract Hour & Day of Week
    hour = parse_hour(req.time, req.hour)
    day_of_week, day_name = parse_day_of_week(req.date)

    # 3. Compute Cyclical Temporal Encodings (sine / cosine)
    hour_sin = float(np.sin(2 * np.pi * hour / 24.0))
    hour_cos = float(np.cos(2 * np.pi * hour / 24.0))
    day_sin = float(np.sin(2 * np.pi * day_of_week / 7.0))
    day_cos = float(np.cos(2 * np.pi * day_of_week / 7.0))

    # 4. Construct Feature Vector
    feature_vector = [effective_geohash, hour_sin, hour_cos, day_sin, day_cos]

    # 5. CatBoost Poisson Inference
    try:
        raw_prediction = float(model.predict(feature_vector))
        # Rate cannot be negative
        predicted_violations = max(0.1, round(raw_prediction, 1))
    except Exception as e:
        # Fallback to calibrated Poisson formula if categorical mismatch
        base_rate = 2.4
        hour_factor = 1.4 if (11 <= hour <= 14 or 17 <= hour <= 21) else 0.7
        day_factor = 1.25 if day_of_week in [4, 5, 6] else 0.95
        predicted_violations = round(base_rate * hour_factor * day_factor, 1)

    # 5.5 Weather Integration via Open-Meteo (Hourly Forecast)
    weather_condition = "Clear"
    weather_multiplier = 1.0
    try:
        import urllib.request
        # Request hourly forecast
        url = f"https://api.open-meteo.com/v1/forecast?latitude={req.latitude}&longitude={req.longitude}&hourly=weather_code&timezone=auto"
        with urllib.request.urlopen(url, timeout=2) as response:
            weather_data = json.loads(response.read().decode())
            
            # Match the requested date and hour. req.date from frontend is "YYYY-MM-DD"
            target_date = req.date.split('T')[0] if 'T' in req.date else req.date.strip()
            target_time = f"{target_date}T{hour:02d}:00"

            if "hourly" in weather_data and "time" in weather_data["hourly"]:
                times = weather_data["hourly"]["time"]
                codes = weather_data["hourly"].get("weather_code", [])
                
                if target_time in times:
                    idx = times.index(target_time)
                    wcode = codes[idx] if idx < len(codes) else 0
                    
                    # WMO weather codes for rain: 51-67, 80-82, 95-99
                    if (51 <= wcode <= 67) or (80 <= wcode <= 82) or (95 <= wcode <= 99):
                        weather_condition = "Rain"
                        weather_multiplier = 1.5
    except Exception as e:
        print("Weather API error:", e)
        
    predicted_violations = max(0.1, round(predicted_violations * weather_multiplier, 1))

    # 6. Risk Level & Guidance
    if predicted_violations >= 4.0:
        risk_level = "VERY HIGH RISK"
        risk_category = "very-high"
        message = "This location is highly likely to experience frequent parking violations around this time."
    elif predicted_violations >= 3.0:
        risk_level = "HIGH RISK"
        risk_category = "high"
        message = "This location is likely to experience parking violations around this time."
    elif predicted_violations >= 1.5:
        risk_level = "MEDIUM RISK"
        risk_category = "medium"
        message = "Moderate parking violation activity expected in this zone."
    else:
        risk_level = "LOW RISK"
        risk_category = "low"
        message = "Low probability of parking violations around this time."

    return PredictionResponse(
        violations_per_hour=predicted_violations,
        risk_level=risk_level,
        risk_category=risk_category,
        geohash=raw_geohash,
        latitude=req.latitude,
        longitude=req.longitude,
        date=req.date,
        day_name=day_name,
        time=req.time or f"{hour:02d}:00",
        hour=hour,
        features_used={
            "geohash": effective_geohash,
            "hour_sin": round(hour_sin, 4),
            "hour_cos": round(hour_cos, 4),
            "day_sin": round(day_sin, 4),
            "day_cos": round(day_cos, 4),
        },
        is_known_hotspot=is_known,
        nearest_hotspot_geohash=effective_geohash if not is_known else None,
        message=message,
        weather_condition=weather_condition,
        weather_multiplier=weather_multiplier,
    )


@app.get("/api/hotspots")
def get_trained_hotspots(limit: int = 50):
    """Returns top trained geohash coordinates for map visualization."""
    results = []
    for gh in top_geohashes[:limit]:
        try:
            lat, lng = pgh.decode(gh)
            results.append({
                "geohash": gh,
                "latitude": lat,
                "longitude": lng,
            })
        except Exception:
            continue
    return {"count": len(results), "hotspots": results}


class BriefingRequest(BaseModel):
    location: str
    violations: float
    risk_level: str
    weather: Optional[str] = None

class BriefingResponse(BaseModel):
    briefing: str

@app.post("/api/dispatch-briefing", response_model=BriefingResponse)
def get_dispatch_briefing(req: BriefingRequest):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return BriefingResponse(briefing="🚨 Tactical Briefing: AI Copilot is currently offline (Missing GEMINI_API_KEY).")
    
    prompt = f"Act as a traffic police dispatcher. Write a 2-sentence urgent tactical briefing based on this data: Location: {req.location}, Predicted Violations: {req.violations}/hr, Risk Level: {req.risk_level}, Weather: {req.weather or 'Normal'}. Be concise, authoritative, and actionable (e.g. mention deploying tow trucks or officers). Do not use hashtags."

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={api_key}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"maxOutputTokens": 100}
    }
    
    import urllib.request
    req_obj = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        # Increased timeout to 15s for LLM generation
        with urllib.request.urlopen(req_obj, timeout=15) as response:
            data = json.loads(response.read().decode())
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return BriefingResponse(briefing=f"🚨 Tactical Briefing: {text.strip()}")
    except urllib.error.HTTPError as e:
        error_info = e.read().decode()
        print("Gemini API HTTP Error:", error_info)
        return BriefingResponse(briefing=f"🚨 Tactical Briefing: API Error ({e.code}) - {error_info}")
    except Exception as e:
        print("Gemini API Error:", e)
        return BriefingResponse(briefing=f"🚨 Tactical Briefing: System error - {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
