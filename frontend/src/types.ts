export interface Location {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
  riskLevel: 'very-high' | 'high' | 'medium' | 'low';
  predictedViolations: number;
}

export interface PredictionResult {
  violations: number;
  riskLevel: 'very-high' | 'high' | 'medium' | 'low';
  riskLabel: string;
  location: string;
  area: string;
  date: string;
  time: string;
  message: string;
  geohash?: string;
  featuresUsed?: {
    geohash: string;
    hour_sin: number;
    hour_cos: number;
    day_sin: number;
    day_cos: number;
  };
  isKnownHotspot?: boolean;
  dayName?: string;
  modelType?: string;
  weatherCondition?: string;
  weatherMultiplier?: number;
  tacticalBriefing?: string;
}

export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
}

export type NavItem = {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}
