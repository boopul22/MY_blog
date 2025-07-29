import { useState, useEffect } from 'react';
import { tagsService } from '../services/supabaseService';
import { Tag } from '../types';

/**
 * Hook for loading non-critical data that doesn't block the initial render
 * This data is loaded after the critical path is complete
 */
export const useNonCriticalData = (isAdmin: boolean) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [nonCriticalLoading, setNonCriticalLoading] = useState(false);
  const [nonCriticalError, setNonCriticalError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    const loadNonCriticalData = async () => {
      try {
        setNonCriticalLoading(true);
        setNonCriticalError(null);

        // Load tags (only needed for admin)
        const tagsData = await tagsService.getAllTags();
        setTags(tagsData);

        // Add other non-critical data here as needed
        // - Analytics data
        // - User preferences
        // - System settings
        // - etc.

      } catch (err) {
        console.error('Failed to load non-critical data:', err);
        setNonCriticalError(err instanceof Error ? err.message : 'Failed to load non-critical data');
      } finally {
        setNonCriticalLoading(false);
      }
    };

    // Delay loading to ensure it doesn't interfere with critical path
    const timer = setTimeout(loadNonCriticalData, 1000);
    return () => clearTimeout(timer);
  }, [isAdmin]);

  return {
    tags,
    nonCriticalLoading,
    nonCriticalError,
  };
};
