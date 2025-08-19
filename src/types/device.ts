export interface Device {
  id: string;
  measurement: number; // percentage value
  tank_level_cm: number; // tank level in cm
  tank_level: number; // same as measurement for display
  timestamp: string; // ISO timestamp
}