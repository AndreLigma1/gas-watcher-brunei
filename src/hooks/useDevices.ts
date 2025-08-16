import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: apiClient.getDevices,
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

export function useDeviceReadings(deviceId: string) {
  return useQuery({
    queryKey: ['deviceReadings', deviceId],
    queryFn: () => apiClient.getDeviceReadings(deviceId),
    enabled: !!deviceId,
    refetchInterval: 60000, // Refetch every minute
  });
}