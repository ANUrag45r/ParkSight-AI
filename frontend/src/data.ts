import { Location, PredictionResult } from './types';

export const locations: Location[] = [
  {
    id: 'mg-road',
    name: 'MG Road',
    area: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5949,
    riskLevel: 'high',
    predictedViolations: 3.2,
  },
  {
    id: 'brigade-road',
    name: 'Brigade Road',
    area: 'Bengaluru',
    lat: 12.9719,
    lng: 77.6070,
    riskLevel: 'very-high',
    predictedViolations: 4.8,
  },
  {
    id: 'commercial-street',
    name: 'Commercial Street',
    area: 'Bengaluru',
    lat: 12.9833,
    lng: 77.6073,
    riskLevel: 'medium',
    predictedViolations: 2.1,
  },
  {
    id: 'ub-city',
    name: 'UB City',
    area: 'Bengaluru',
    lat: 12.9716,
    lng: 77.5960,
    riskLevel: 'high',
    predictedViolations: 3.7,
  },
  {
    id: 'church-street',
    name: 'Church Street',
    area: 'Bengaluru',
    lat: 12.9750,
    lng: 77.6050,
    riskLevel: 'low',
    predictedViolations: 1.2,
  },
  {
    id: 'residency-road',
    name: 'Residency Road',
    area: 'Bengaluru',
    lat: 12.9700,
    lng: 77.5990,
    riskLevel: 'medium',
    predictedViolations: 2.5,
  },
  {
    id: 'koramangala',
    name: 'Koramangala',
    area: 'Bengaluru',
    lat: 12.9352,
    lng: 77.6245,
    riskLevel: 'high',
    predictedViolations: 3.9,
  },
  {
    id: 'indiranagar',
    name: 'Indiranagar',
    area: 'Bengaluru',
    lat: 12.9784,
    lng: 77.6408,
    riskLevel: 'medium',
    predictedViolations: 2.3,
  },
];

export function getPrediction(locationId: string, _date: string, _time: string): PredictionResult {
  const location = locations.find(l => l.id === locationId) || locations[0];
  
  // Simulate slight variation
  const variation = (Math.random() - 0.5) * 0.6;
  const violations = Math.max(0.5, parseFloat((location.predictedViolations + variation).toFixed(1)));
  
  let riskLevel: PredictionResult['riskLevel'];
  let riskLabel: string;
  
  if (violations >= 4) {
    riskLevel = 'very-high';
    riskLabel = 'VERY HIGH RISK';
  } else if (violations >= 3) {
    riskLevel = 'high';
    riskLabel = 'HIGH RISK';
  } else if (violations >= 2) {
    riskLevel = 'medium';
    riskLabel = 'MEDIUM RISK';
  } else {
    riskLevel = 'low';
    riskLabel = 'LOW RISK';
  }

  return {
    violations,
    riskLevel,
    riskLabel,
    location: location.name,
    area: location.area,
    date: _date,
    time: _time,
    message: getRiskMessage(riskLevel),
  };
}

function getRiskMessage(riskLevel: string): string {
  switch (riskLevel) {
    case 'very-high':
      return 'This location is highly likely to experience frequent parking violations around this time.';
    case 'high':
      return 'This location is likely to experience parking violations around this time.';
    case 'medium':
      return 'This location may experience some parking violations around this time.';
    case 'low':
      return 'This location has a low probability of parking violations around this time.';
    default:
      return 'Prediction data available.';
  }
}

export const navItems = [
  { id: 'home', label: 'Home', icon: 'Home', active: true },
  { id: 'predictor', label: 'Predictor', icon: 'Crosshair' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
  { id: 'hotspots', label: 'Hotspots', icon: 'MapPin' },
  { id: 'reports', label: 'Reports', icon: 'FileText' },
  { id: 'settings', label: 'Settings', icon: 'Settings' },
];
