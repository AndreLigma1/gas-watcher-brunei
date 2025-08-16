import { TankDevice, GasReading } from '@/types/device';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

// Mock data for demonstration
const mockDevices: TankDevice[] = [
  {
    id: "dev_001",
    tankId: "LPG-A-101",
    label: "Kitchen Main Tank",
    gasType: "LPG",
    location: "Building A - Kitchen",
    status: "online",
    lastReadingAt: "2024-01-16T14:30:00.000Z",
    attributes: {
      capacityLiters: 500,
      fillPercent: 85,
      pressureKpa: 1200,
      temperatureC: 22,
      batteryPercent: 92,
      installedAt: "2023-06-15T09:00:00.000Z",
      lastInspectionAt: "2024-01-10T10:00:00.000Z",
      notes: "Regular maintenance completed"
    }
  },
  {
    id: "dev_002",
    tankId: "CO2-B-205",
    label: "Lab CO2 Supply",
    gasType: "CO2",
    location: "Building B - Lab 205",
    status: "warning",
    lastReadingAt: "2024-01-16T14:28:00.000Z",
    attributes: {
      capacityLiters: 200,
      fillPercent: 25,
      pressureKpa: 800,
      temperatureC: 18,
      batteryPercent: 78,
      installedAt: "2023-08-20T14:30:00.000Z",
      lastInspectionAt: "2024-01-08T11:00:00.000Z",
      notes: "Low fill level - schedule refill"
    }
  },
  {
    id: "dev_003",
    tankId: "CH4-C-301",
    label: "Warehouse Methane Detector",
    gasType: "CH4",
    location: "Building C - Warehouse",
    status: "critical",
    lastReadingAt: "2024-01-16T14:25:00.000Z",
    attributes: {
      capacityLiters: 100,
      fillPercent: 5,
      pressureKpa: 200,
      temperatureC: 25,
      batteryPercent: 15,
      installedAt: "2023-09-10T08:00:00.000Z",
      lastInspectionAt: "2024-01-05T09:30:00.000Z",
      notes: "URGENT: Critical gas levels detected"
    }
  },
  {
    id: "dev_004",
    tankId: "O2-A-102",
    label: "Medical Oxygen Tank",
    gasType: "O2",
    location: "Building A - Medical Room",
    status: "offline",
    lastReadingAt: "2024-01-16T12:15:00.000Z",
    attributes: {
      capacityLiters: 300,
      fillPercent: 60,
      pressureKpa: 1000,
      temperatureC: 20,
      batteryPercent: 5,
      installedAt: "2023-07-05T16:00:00.000Z",
      lastInspectionAt: "2024-01-12T14:00:00.000Z",
      notes: "Device offline - check power supply"
    }
  },
  {
    id: "dev_005",
    tankId: "LPG-B-203",
    label: "Cafeteria Backup Tank",
    gasType: "LPG",
    location: "Building B - Cafeteria",
    status: "online",
    lastReadingAt: "2024-01-16T14:32:00.000Z",
    attributes: {
      capacityLiters: 400,
      fillPercent: 95,
      pressureKpa: 1300,
      temperatureC: 21,
      batteryPercent: 88,
      installedAt: "2023-05-12T11:00:00.000Z",
      lastInspectionAt: "2024-01-09T15:30:00.000Z"
    }
  }
];

// Generate mock readings for the last 24 hours
const generateMockReadings = (deviceId: string, baseValue: number = 100): GasReading[] => {
  const readings: GasReading[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000); // Every hour for 24 hours
    const variation = (Math.random() - 0.5) * 20; // ±10 variation
    
    readings.push({
      deviceId,
      ts: timestamp.toISOString(),
      ppm: Math.max(0, baseValue + variation),
      temperatureC: 20 + (Math.random() - 0.5) * 10,
      pressureKpa: 1000 + (Math.random() - 0.5) * 400,
      batteryPercent: 80 + Math.random() * 20
    });
  }
  
  return readings.reverse(); // Oldest first
};

export const apiClient = {
  async getDevices(): Promise<TankDevice[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDevices;
  },

  async getDevice(deviceId: string): Promise<TankDevice | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockDevices.find(device => device.id === deviceId) || null;
  },

  async getDeviceReadings(deviceId: string): Promise<GasReading[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const device = mockDevices.find(d => d.id === deviceId);
    if (!device) return [];
    
    const baseValue = device.gasType === 'CO2' ? 400 : 
                     device.gasType === 'CH4' ? 50 : 
                     device.gasType === 'O2' ? 210000 : 100;
    
    return generateMockReadings(deviceId, baseValue);
  }
};