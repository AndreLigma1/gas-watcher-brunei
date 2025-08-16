export type DeviceStatus = "online" | "offline" | "warning" | "critical";

export interface TankDevice {
  id: string;            // deviceId (unique)
  tankId: string;        // human/ops ID printed on tank
  label: string;         // friendly name
  gasType: "LPG" | "CO2" | "CH4" | "O2" | "Other";
  location: string;      // room/site
  status: DeviceStatus;
  lastReadingAt: string; // ISO
  attributes: {
    capacityLiters?: number;
    fillPercent?: number;      // 0..100
    pressureKpa?: number;
    temperatureC?: number;
    batteryPercent?: number;
    installedAt?: string;      // ISO
    lastInspectionAt?: string; // ISO
    notes?: string;
  };
}

export interface GasReading {
  deviceId: string;
  ts: string;  // ISO timestamp
  ppm: number; // gas concentration
  temperatureC?: number;
  pressureKpa?: number;
  batteryPercent?: number;
}