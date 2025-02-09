export interface CareGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  member_count: number;
  is_owner?: boolean;
  is_public?: boolean;
  location?: string;
  privacy_settings?: GroupPrivacySettings;
}

export interface GroupPrivacySettings {
  visibility: 'public' | 'private';
  status?: 'normal' | 'warning' | 'urgent' | 'emergency';
  lastUpdated?: string;
}

export interface GroupMember {
  id: string;
  user_id: string;
  group_id: string;
  role: string;
  member_type?: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export interface GeofenceConfig {
  id?: string;
  group_id: string;
  name: string;
  description?: string;
  boundary_type: 'circle' | 'polygon';
  center_lat: number;
  center_lng: number;
  radius: number;
  polygon_coordinates?: number[][];
  active: boolean;
  notification_settings: NotificationSettings;
  danger_zones?: DangerZone[];
  created_at?: string;
  updated_at?: string;
}

export interface NotificationSettings {
  exitAlert: boolean; 
  enterAlert: boolean;
  smsAlert: boolean;
  emailAlert?: boolean;
  pushNotifications?: boolean;
  notifyCaregiver?: boolean;
  notifyEmergencyContact?: boolean;
  escalationTimeout?: number; // minutes before escalating alert
}

export interface DangerZone {
  coordinates: number[][];
  typeId: string;
  type: string;
  alertLevel?: 'warning' | 'danger' | 'emergency';
  restrictions?: string[];
}

export interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp: string;
  battery_level?: number;
  activity_type?: 'still' | 'walking' | 'running' | 'driving';
  network_status?: 'online' | 'offline';
  provider?: 'gps' | 'network' | 'passive';
}
