export interface Device {
  id: string;
  measurement: number; // percentage value
  tank_level: number; // same as measurement for display
  timestamp: string; // ISO timestamp
}