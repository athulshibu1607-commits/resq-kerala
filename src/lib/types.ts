export type UserRole = 'citizen' | 'volunteer' | 'camp' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  nameMl?: string;
  phone: string;
  email?: string;
  role: UserRole;
  district: string;
  panchayat?: string;
  isVerified: boolean;
  assignedSector?: string;
  activeBadge?: string;
}

export type IncidentCategory = 'flood' | 'landslide' | 'medical' | 'boat_rescue' | 'food_water' | 'structural';
export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'pending' | 'verified' | 'dispatched' | 'in_transit' | 'resolved';

export interface Incident {
  id: string;
  trackingCode: string;
  title: string;
  titleMl: string;
  district: string;
  panchayat: string;
  locationDescription: string;
  lat: number;
  lng: number;
  category: IncidentCategory;
  severity: IncidentSeverity;
  peopleAffected: number;
  specialNeeds: string[];
  status: IncidentStatus;
  contactName: string;
  contactPhone: string;
  notes?: string;
  photoUrl?: string;
  reportedAt: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  aiPriorityScore: number;
  isAiDuplicate?: boolean;
  isOfflineQueued?: boolean;
  actionTimeline: {
    status: IncidentStatus;
    label: string;
    timestamp: string;
    actor: string;
  }[];
}

export interface ReliefCamp {
  id: string;
  name: string;
  nameMl: string;
  district: string;
  taluk: string;
  address: string;
  lat: number;
  lng: number;
  capacity: number;
  currentOccupancy: number;
  availableBeds: number;
  foodSupplyStatus: 'adequate' | 'low' | 'critical';
  hasGenerator: boolean;
  hasMedicalSupport: boolean;
  hasBabyFood: boolean;
  coordinatorName: string;
  coordinatorPhone: string;
  verifiedStatus: 'verified' | 'provisional';
}

export interface ResourceItem {
  id: string;
  name: string;
  category: 'water' | 'food' | 'medicine' | 'rescue_kits' | 'boats' | 'vehicles' | 'medical_teams';
  unit: string;
  available: number;
  allocated: number;
  delivered: number;
  pending: number;
  targetDistrict: string;
  updatedAt: string;
}

export interface HydroStation {
  id: string;
  riverName: string;
  locationName: string;
  district: string;
  currentLevelM: number;
  warningLevelM: number;
  dangerLevelM: number;
  trend: 'rising' | 'steady' | 'falling';
  status: 'normal' | 'warning' | 'danger';
  rainfall6hMm: number;
  damShutterStatus?: string;
}

export interface EmergencyContact {
  id: string;
  category: string;
  name: string;
  nameMl: string;
  phone: string;
  tollFree?: string;
  description: string;
  priority: number;
}
