import { useQuery } from "@tanstack/react-query";
import { apiClient as api } from "../lib/api";


export function useDevices() {
  return useQuery({ queryKey: ["devices"], queryFn: api.getDevices, refetchInterval: 10_000 });
}

export function useDevice(id?: string) {
  return useQuery({ queryKey: ["device", id], queryFn: () => api.getDevice(id!), enabled: !!id });
}


// No getReadings in apiClient. Implement or remove as needed.
