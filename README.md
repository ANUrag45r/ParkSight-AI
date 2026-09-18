# SightSpot_AI (SlotSight AI) 🚗🏙️
> **Smarter Parking. Safer Cities.**  
> An AI-powered smart-city command center predicting urban parking violations using CatBoost Poisson regression and spatiotemporal geohash grids.

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.133-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![CatBoost](https://img.shields.io/badge/CatBoost-1.2-F58025?style=flat&logo=yandex&logoColor=white)](https://catboost.ai/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat&logo=leaflet&logoColor=white)](https://leafletjs.com/)

---

## 🌟 Key Highlights

- **Futuristic AI Command Center UI**: Dark navy `#050B18` glassmorphism aesthetic with cyan, purple, and neon accents.
- **5-Feature Spatiotemporal ML Pipeline**:
  - `geohash`: Precision 7 (~150m spatial cluster)
  - `hour_sin` & `hour_cos`: Cyclical 24-hour diurnal encoding
  - `day_sin` & `day_cos`: Cyclical 7-day weekly encoding
- **Real-Time Interactive Leaflet Map**:
  - Zero-API-key, watermark-free **Esri World Dark Gray Base & Reference** map layers.
  - Live Google Maps-style colored traffic flow polylines with animated velocity dashes.
  - **3D Isometric Drone Perspective** tilt mode.
  - Violation risk heatmap zones and pulsing radar location pins.
- **Comprehensive Functional Panels**:
  - **Predictor**: Real-time violation forecasting with time and date selectors.
  - **Analytics**: 24-hour hourly cycle density, weekly risk progression, violation category breakdown.
  - **Hotspots**: Monitored Bangalore hotspots with geohash precision-7 metrics.
  - **Reports**: AI patrol dispatch directives and downloadable CSV/JSON audit logs.
  - **Settings**: CatBoost model diagnostics, latency test, and threshold tuning.

---

## 🏗️ Architecture

```
 USER SELECTION (Frontend)
   │
   ├── 📍 Location on Map / Dropdown (Latitude, Longitude)
   ├── 📅 Date (e.g. 17 September 2026)
   └── 🕐 Time (e.g. 06:00 PM)
         │
         ▼ POST http://127.0.0.1:8000/api/predict
 BACKEND FEATURE CONVERTER (FastAPI + pygeohash + NumPy)
   │
   ├── 1. geohash = pygeohash.encode(lat, lon, precision=7) [~150m bucket]
   ├── 2. hour = 18
   │      ├── hour_sin = sin(2π × 18 / 24)
   │      └── hour_cos = cos(2π × 18 / 24)
   └── 3. day_of_week = 3 (Thursday)
          ├── day_sin = sin(2π × 3 / 7)
          └── day_cos = cos(2π × 3 / 7)
         │
         ▼
 CATBOOST POISSON REGRESSOR (`parksight_model.cbm`)
   │
   ├── Evaluates [geohash, hour_sin, hour_cos, day_sin, day_cos]
   ├── Filtered on Top Trained Hotspot Geohashes
   └── Computes expected hourly Poisson violation count
         │
         ▼
 DASHBOARD PRESENTATION (React + Tailwind + Leaflet)
   • Predicted Violations (e.g. 2.9 violations / hour)
   • Risk Classification (Low, Medium, High, Very High)
   • Geohash precision 7 display
   • Mathematical 5-feature vector inspector
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v20)
- **Python**: 3.10+

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Dashboard will be live at `http://localhost:5173/`.

### 3. Backend Setup
```bash
# Install python dependencies
pip install fastapi uvicorn catboost pygeohash numpy pandas

# Start FastAPI server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend API will be live at `http://127.0.0.1:8000/`.

---

## 📊 Model Information

- **Algorithm**: `CatBoostRegressor`
- **Objective Function**: `Poisson` (Count-based loss)
- **Evaluation Metric**: `Poisson`
- **Features**: `geohash`, `hour_sin`, `hour_cos`, `day_sin`, `day_cos`
- **Artifacts**: `parksight_model.cbm`, `top_geohashes.json`

---

## 📜 License
MIT License. Created by [Anurag Sinha](https://github.com/ANUrag45r).
