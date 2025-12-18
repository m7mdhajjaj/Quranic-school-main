import { useState, useMemo, useCallback } from 'react';
import type { INews } from '@/Api/newsApi';

export const useNewsFilter = (newsItems: INews[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [filterType, setFilterType] = useState<'all' | 'general' | 'group'>('all');

  // Memoize search term processing
  const searchLower = useMemo(
    () => searchTerm.trim().toLowerCase(),
    [searchTerm]
  );

  // Memoize filtering and sorting logic
  const filteredNews = useMemo(() => {
    let filtered = newsItems;

    // Apply search filter (optimized)
    if (searchLower) {
      filtered = filtered.filter((item) => {
        const titleMatch = item.title?.toLowerCase().includes(searchLower);
        const contentMatch = item.content?.toLowerCase().includes(searchLower);
        return titleMatch || contentMatch;
      });
    }

    // Apply visibility filter
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.visibility === filterType);
    }

    // Apply sorting (avoid unnecessary array copy if no filtering applied)
    if (filtered === newsItems && sortOrder === 'newest') {
      // Already sorted newest first from API, no need to sort
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [newsItems, searchLower, sortOrder, filterType]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setSortOrder(value as 'newest' | 'oldest');
  }, []);

  const handleFilterTypeChange = useCallback((value: 'all' | 'general' | 'group') => {
    setFilterType(value);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSortOrder('newest');
    setFilterType('all');
  }, []);

  return {
    searchTerm,
    sortOrder,
    filterType,
    filteredNews,
    handleSearchChange,
    handleSortChange,
    handleFilterTypeChange,
    handleClearFilters,
  };
};
