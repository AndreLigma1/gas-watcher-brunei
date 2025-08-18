import { Device } from '@/types/device';

// Use the direct backend API URL for development/testing
const API_BASE_URL = 'http://192.168.123.129/api';

export const apiClient = {
  async getDevices(): Promise<Device[]> {
    const response = await fetch(`${API_BASE_URL}/devices`);
    if (!response.ok) {
      throw new Error('Failed to fetch devices');
    }
    return response.json();
  },

  async getDevice(deviceId: string): Promise<Device | null> {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  }
};