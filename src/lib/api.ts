import { Device } from '@/types/device';

// Sample data for display purposes
const sampleDevices: Device[] = [
  {
    id: "TANK-001",
    measurement: 42.5,
    tank_level: 78,
    timestamp: new Date().toISOString(),
  }
];

export const apiClient = {
  async getDevices(): Promise<Device[]> {
    // Return sample data for display purposes
    return new Promise((resolve) => {
      setTimeout(() => resolve(sampleDevices), 500);
    });
  },

  async getDevice(deviceId: string): Promise<Device | null> {
    // Return sample device if it matches
    return new Promise((resolve) => {
      setTimeout(() => {
        const device = sampleDevices.find(d => d.id === deviceId) || null;
        resolve(device);
      }, 300);
    });
  }
};