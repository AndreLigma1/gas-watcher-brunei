import { Device } from '@/types/device';

const BASE_URL = 'http://192.168.123.129/api';

export const apiClient = {

  /**
   * Fetch devices with optional filter. Only one filter is allowed at a time.
   * @param filter { manufacturer_id?: string; distributor_id?: string; consumer_id?: string }
   */
  async getDevices(filter?: {
    manufacturer_id?: string;
    distributor_id?: string;
    consumer_id?: string;
  }): Promise<Device[]> {
    let url = `${BASE_URL}/devices`;
    if (filter) {
      const params = new URLSearchParams();
      if (filter.manufacturer_id) params.append('manufacturer_id', filter.manufacturer_id);
      else if (filter.distributor_id) params.append('distributor_id', filter.distributor_id);
      else if (filter.consumer_id) params.append('consumer_id', filter.consumer_id);
      const query = params.toString();
      if (query) url += `?${query}`;
    }
    const res = await fetch(url, {
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
      measurement: Number(d.measurement), // percentage value
      tank_level_cm: Number(d.tank_level), // tank level in cm
      tank_level: Number(d.measurement), // use measurement as percentage for display
      timestamp: String(d.timestamp),
      consumer_id: d.consumer_id !== undefined ? String(d.consumer_id) : undefined,
      location: d.location !== undefined ? String(d.location) : undefined,
      tank_type: d.tank_type !== undefined ? String(d.tank_type) : undefined,
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
            measurement: Number(d.measurement), // percentage value
            tank_level_cm: Number(d.tank_level), // tank level in cm
            tank_level: Number(d.measurement), // use measurement as percentage for display
            timestamp: String(d.timestamp),
            consumer_id: d.consumer_id !== undefined ? String(d.consumer_id) : undefined,
            location: d.location !== undefined ? String(d.location) : undefined,
            tank_type: d.tank_type !== undefined ? String(d.tank_type) : undefined,
          } as Device;
        }
      }
    } catch {
      // ignore and fallback
    }

    const all = await this.getDevices();

    return all.find((d) => d.id === deviceId) || null;
  },

  /**
   * Update device location and/or tank_type
   */
  async updateDevice(deviceId: string, data: { location?: string; tank_type?: string }): Promise<Device | null> {
    const res = await fetch(`${BASE_URL}/devices/${encodeURIComponent(deviceId)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Failed to update device: ${res.status} ${res.statusText}`);
    }
    const d = await res.json();
    if (d && d.device && d.device.id !== undefined) {
      // Only return updated fields, not a full Device object
      return {
        id: String(d.device.id),
        location: d.device.location !== undefined ? String(d.device.location) : undefined,
        tank_type: d.device.tank_type !== undefined ? String(d.device.tank_type) : undefined,
      } as Device;
    }
    return null;
  },
};