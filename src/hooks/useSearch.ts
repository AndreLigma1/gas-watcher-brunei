import { useMemo, useState } from 'react';
import Fuse from 'fuse.js';
import { TankDevice } from '@/types/device';

interface UseSearchProps {
  data: TankDevice[];
  searchFields?: string[];
}

export function useSearch({ data, searchFields = ['label', 'tankId', 'location', 'gasType'] }: UseSearchProps) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: searchFields,
      threshold: 0.3, // Fuzzy search threshold
      includeScore: true,
    });
  }, [data, searchFields]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return data;
    }

    const searchResults = fuse.search(query);
    return searchResults.map(result => result.item);
  }, [query, fuse, data]);

  return {
    query,
    setQuery,
    results,
    hasQuery: !!query.trim(),
  };
}