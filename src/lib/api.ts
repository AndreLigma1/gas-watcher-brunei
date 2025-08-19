import { Device } from '@/types/device';

const BASE_URL = 'http://192.168.123.129/api';

export const apiClient = {
  async getDevices(): Promise<Device[]> {
    const res = await fetch(`${BASE_URL}/devices`, {
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch devices: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid devices payload');
    }

    return data.map((d: any) => ({
      id: String(d.id),
      measurement: Number(d.measurement),
      tank_level: Number(d.measurement), // measurement is the percentage value
      timestamp: String(d.timestamp),
    })) as Device[];
  },

  async getDevice(deviceId: string): Promise<Device | null> {
    // Try to fetch a single device; if unsupported, fall back to list and filter
    try {
      const res = await fetch(`${BASE_URL}/devices/${encodeURIComponent(deviceId)}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const d = await res.json();
        if (d && d.id !== undefined) {
          return {
            id: String(d.id),
            measurement: Number(d.measurement),
            tank_level: Number(d.measurement), // measurement is the percentage value
            timestamp: String(d.timestamp),
          } as Device;
        }
      }
    } catch {
      // ignore and fallback
    }

    const all = await this.getDevices();
    return all.find((d) => d.id === deviceId) || null;
  },
};