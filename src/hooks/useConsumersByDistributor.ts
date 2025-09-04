import { useQuery } from '@tanstack/react-query';

export function useConsumersByDistributor(distributor_id: string | undefined) {
  return useQuery({
    queryKey: ['consumers', distributor_id],
    queryFn: async () => {
      if (!distributor_id) return [];
      const res = await fetch(`/api/consumers?sort=name&dir=asc`);
      const data = await res.json();
      if (!data.ok) throw new Error('Failed to fetch consumers');
      return data.items.filter((c: any) => c.distributor_id === distributor_id);
    },
    enabled: !!distributor_id,
  });
}
