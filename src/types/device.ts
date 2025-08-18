export interface Device {
  id: string;
  measurement: number;
  tank_level: number;
  timestamp: string; // ISO timestamp
}