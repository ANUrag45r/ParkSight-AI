export interface TrafficSegment {
  id: string;
  name: string;
  coords: [number, number][];
  status: 'standstill' | 'congested' | 'moderate' | 'free';
  speedKmH: number;
  violationRisk: 'very-high' | 'high' | 'medium' | 'low';
}

export interface RiskZone {
  id: string;
  name: string;
  center: [number, number];
  radius: number;
  riskLevel: 'very-high' | 'high' | 'medium' | 'low';
  color: string;
  predictedRate: number;
}

export interface SensorNode {
  id: string;
  coords: [number, number];
  status: 'occupied' | 'violating' | 'vacant';
  lastPing: string;
}

// Real Bangalore Road Coordinates for Major Arteries
export const initialTrafficSegments: TrafficSegment[] = [
  {
    id: 'mg-road-core',
    name: 'MG Road (Trinity Circle to Anil Kumble Circle)',
    coords: [
      [12.9722, 77.6200], // Trinity Circle
      [12.9734, 77.6145], // Mayo Hall
      [12.9744, 77.6074], // Brigade Rd Junction
      [12.9750, 77.6030], // Anil Kumble Circle
      [12.9760, 77.5985], // Queen's statue
    ],
    status: 'standstill',
    speedKmH: 7,
    violationRisk: 'very-high',
  },
  {
    id: 'brigade-road',
    name: 'Brigade Road (MG Rd to Hosur Rd)',
    coords: [
      [12.9744, 77.6074],
      [12.9715, 77.6072],
      [12.9680, 77.6070],
      [12.9645, 77.6068],
      [12.9620, 77.6070],
    ],
    status: 'congested',
    speedKmH: 14,
    violationRisk: 'high',
  },
  {
    id: 'church-street',
    name: 'Church Street (Pedestrian & Valet Corridor)',
    coords: [
      [12.9750, 77.6025],
      [12.9748, 77.6050],
      [12.9745, 77.6073],
    ],
    status: 'moderate',
    speedKmH: 18,
    violationRisk: 'medium',
  },
  {
    id: 'residency-road',
    name: 'Residency Road (Field Marshal Cariappa Rd)',
    coords: [
      [12.9685, 77.5980],
      [12.9692, 77.6035],
      [12.9702, 77.6095],
      [12.9710, 77.6150],
    ],
    status: 'congested',
    speedKmH: 16,
    violationRisk: 'high',
  },
  {
    id: 'kasturba-road',
    name: 'Kasturba Road (UB City & Chinnaswamy)',
    coords: [
      [12.9705, 77.5955],
      [12.9730, 77.5962],
      [12.9765, 77.5975],
      [12.9790, 77.5988],
    ],
    status: 'moderate',
    speedKmH: 26,
    violationRisk: 'medium',
  },
  {
    id: 'commercial-street-artery',
    name: 'Commercial Street & Kamaraj Road',
    coords: [
      [12.9810, 77.6080],
      [12.9833, 77.6073],
      [12.9860, 77.6065],
      [12.9880, 77.6060],
    ],
    status: 'congested',
    speedKmH: 11,
    violationRisk: 'high',
  },
  {
    id: 'cubbon-road',
    name: 'Cubbon Road (Manipal Centre to Parade Ground)',
    coords: [
      [12.9790, 77.6160],
      [12.9785, 77.6100],
      [12.9780, 77.6030],
      [12.9775, 77.5980],
    ],
    status: 'free',
    speedKmH: 44,
    violationRisk: 'low',
  },
  {
    id: 'lavelle-road',
    name: 'Lavelle Road Bypass',
    coords: [
      [12.9710, 77.5970],
      [12.9675, 77.5985],
      [12.9650, 77.6010],
    ],
    status: 'free',
    speedKmH: 38,
    violationRisk: 'low',
  },
];

// Violation Risk Heatmap Zones
export const initialRiskZones: RiskZone[] = [
  {
    id: 'zone-mg-road',
    name: 'MG Road Central Corridor',
    center: [12.9744, 77.6074],
    radius: 420,
    riskLevel: 'very-high',
    color: '#FF3158',
    predictedRate: 4.6,
  },
  {
    id: 'zone-commercial-st',
    name: 'Commercial Street Bazaar',
    center: [12.9833, 77.6073],
    radius: 360,
    riskLevel: 'high',
    color: '#FF9F1C',
    predictedRate: 3.8,
  },
  {
    id: 'zone-ub-city',
    name: 'UB City / Vittal Mallya High-Traffic',
    center: [12.9716, 77.5960],
    radius: 320,
    riskLevel: 'high',
    color: '#FF9F1C',
    predictedRate: 3.5,
  },
  {
    id: 'zone-residency',
    name: 'Residency Road Commercial Sector',
    center: [12.9695, 77.6050],
    radius: 300,
    riskLevel: 'medium',
    color: '#20C96B',
    predictedRate: 2.3,
  },
  {
    id: 'zone-church-st',
    name: 'Church Street Nightlife Area',
    center: [12.9748, 77.6045],
    radius: 220,
    riskLevel: 'medium',
    color: '#20C96B',
    predictedRate: 2.1,
  },
  {
    id: 'zone-cubbon-park',
    name: 'Cubbon Park Transit Perimeter',
    center: [12.9760, 77.5930],
    radius: 280,
    riskLevel: 'low',
    color: '#149EFF',
    predictedRate: 1.1,
  },
];

// Smart IoT parking meters / camera nodes
export const initialSensorNodes: SensorNode[] = [
  { id: 'S-101', coords: [12.9740, 77.6070], status: 'violating', lastPing: 'Just now' },
  { id: 'S-102', coords: [12.9745, 77.6090], status: 'violating', lastPing: '3s ago' },
  { id: 'S-103', coords: [12.9730, 77.6130], status: 'occupied', lastPing: '5s ago' },
  { id: 'S-104', coords: [12.9718, 77.5965], status: 'violating', lastPing: 'Just now' },
  { id: 'S-105', coords: [12.9830, 77.6070], status: 'violating', lastPing: '8s ago' },
  { id: 'S-106', coords: [12.9752, 77.6035], status: 'vacant', lastPing: '1s ago' },
  { id: 'S-107', coords: [12.9688, 77.6040], status: 'occupied', lastPing: '4s ago' },
  { id: 'S-108', coords: [12.9780, 77.6050], status: 'vacant', lastPing: '2s ago' },
];

export const getTrafficColor = (status: TrafficSegment['status']): string => {
  switch (status) {
    case 'standstill':
      return '#FF3158'; // Red neon
    case 'congested':
      return '#FF9F1C'; // Amber neon
    case 'moderate':
      return '#00A8FF'; // Electric blue
    case 'free':
      return '#20C96B'; // Emerald green neon
  }
};
