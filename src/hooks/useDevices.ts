
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

type DeviceFilter = {
  manufacturer_id?: string;
  distributor_id?: string;
  consumer_id?: string;
};

export function useDevices(filter?: DeviceFilter) {
  return useQuery({
    queryKey: ['devices', filter],
    queryFn: () => apiClient.getDevices(filter),
    refetchInterval: 30000, // Refetch every 30 seconds for live data
  });
}

export function useDevice(deviceId: string) {
  return useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => apiClient.getDevice(deviceId),
    enabled: !!deviceId,
  });
}
