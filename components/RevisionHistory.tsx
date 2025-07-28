import React, { useState, useEffect } from 'react';
import { PostRevision } from '../types';
import { revisionService } from '../services/revisionService';

interface RevisionHistoryProps {
  postId: string;
  onRevisionRestore?: (revisionId: string) => void;
  className?: string;
}

const RevisionHistory: React.FC<RevisionHistoryProps> = ({
  postId,
  onRevisionRestore,
  className = ''
}) => {
  const [revisions, setRevisions] = useState<PostRevision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRevisions, setSelectedRevisions] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (postId) {
      loadRevisions();
      loadStats();
    }
  }, [postId]);

  const loadRevisions = async () => {
    try {
      setIsLoading(true);
      const { revisions: data } = await revisionService.getRevisions(postId, {
        revisionType: 'revision',
        limit: 20
      });
      setRevisions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revisions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await revisionService.getRevisionStats(postId);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load revision stats:', err);
    }
  };

  const handleRevisionSelect = (revisionId: string) => {
    setSelectedRevisions(prev => {
      if (prev.includes(revisionId)) {
        return prev.filter(id => id !== revisionId);
      } else if (prev.length < 2) {
        return [...prev, revisionId];
      } else {
        return [prev[1], revisionId]; // Replace first selection
      }
    });
  };

  const handleCompareRevisions = async () => {
    if (selectedRevisions.length !== 2) return;

    try {
      setIsLoading(true);
      const comparison = await revisionService.compareRevisions(
        selectedRevisions[0],
        selectedRevisions[1]
      );
      setComparisonData(comparison);
      setShowComparison(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare revisions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreRevision = async (revisionId: string) => {
    if (!confirm('Are you sure you want to restore this revision? This will create a new revision with the current content before restoring.')) {
      return;
    }

    try {
      await revisionService.restoreRevision(postId, revisionId);
      await loadRevisions();
      onRevisionRestore?.(revisionId);
      alert('Revision restored successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore revision');
    }
  };

  const handleCleanupOldRevisions = async () => {
    if (!confirm('This will delete old revisions, keeping only the 10 most recent. Continue?')) {
      return;
    }

    try {
      const result = await revisionService.cleanupOldRevisions(postId, 10);
      await loadRevisions();
      await loadStats();
      alert(`Deleted ${result.deleted} old revisions`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cleanup revisions');
    }
  };

  const formatTimeDifference = (date1: string, date2: string): string => {
    const diff = new Date(date1).getTime() - new Date(date2).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ago`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
  };

  if (isLoading && revisions.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Revision History
        </h3>
        <div className="flex space-x-2">
          {selectedRevisions.length === 2 && (
            <button
              onClick={handleCompareRevisions}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Compare
            </button>
          )}
          <button
            onClick={handleCleanupOldRevisions}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cleanup
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Revisions</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.totalRevisions}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Autosaves</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {stats.totalAutosaves}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">First Revision</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.oldestRevision ? new Date(stats.oldestRevision).toLocaleDateString() : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="text-xs text-gray-500 dark:text-gray-400">Latest Revision</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {stats.newestRevision ? new Date(stats.newestRevision).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Select up to 2 revisions to compare them, or click "Restore" to revert to a specific version.
        </p>
      </div>

      {/* Revisions List */}
      {revisions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No revisions found for this post.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {revisions.map((revision, index) => (
            <RevisionCard
              key={revision.id}
              revision={revision}
              isSelected={selectedRevisions.includes(revision.id)}
              onSelect={() => handleRevisionSelect(revision.id)}
              onRestore={() => handleRestoreRevision(revision.id)}
              timeDifference={
                index < revisions.length - 1
                  ? formatTimeDifference(revision.createdAt, revisions[index + 1].createdAt)
                  : 'Initial version'
              }
              canSelect={selectedRevisions.length < 2 || selectedRevisions.includes(revision.id)}
            />
          ))}
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && comparisonData && (
        <RevisionComparison
          comparisonData={comparisonData}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};

interface RevisionCardProps {
  revision: PostRevision;
  isSelected: boolean;
  onSelect: () => void;
  onRestore: () => void;
  timeDifference: string;
  canSelect: boolean;
}

const RevisionCard: React.FC<RevisionCardProps> = ({
  revision,
  isSelected,
  onSelect,
  onRestore,
  timeDifference,
  canSelect
}) => {
  return (
    <div className={`border rounded-lg p-4 transition-colors ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              disabled={!canSelect}
              className="rounded"
            />
            <h4 className="font-medium text-gray-900 dark:text-white">
              {revision.title}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {timeDifference}
            </span>
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            By {revision.authorName} on {new Date(revision.createdAt).toLocaleString()}
          </div>
          
          {revision.excerpt && (
            <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
              {revision.excerpt}
            </p>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={onRestore}
            className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

interface RevisionComparisonProps {
  comparisonData: any;
  onClose: () => void;
}

const RevisionComparison: React.FC<RevisionComparisonProps> = ({
  comparisonData,
  onClose
}) => {
  const { revision1, revision2, differences } = comparisonData;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Revision Comparison
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Revision from {new Date(revision1.createdAt).toLocaleString()}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                By {revision1.authorName}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                Revision from {new Date(revision2.createdAt).toLocaleString()}
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                By {revision2.authorName}
              </div>
            </div>
          </div>

          {/* Comparison Fields */}
          <div className="space-y-6">
            {differences.title && (
              <ComparisonField
                label="Title"
                value1={revision1.title}
                value2={revision2.title}
              />
            )}
            
            {differences.content && (
              <ComparisonField
                label="Content"
                value1={revision1.content}
                value2={revision2.content}
                isLongText
              />
            )}
            
            {differences.excerpt && (
              <ComparisonField
                label="Excerpt"
                value1={revision1.excerpt || ''}
                value2={revision2.excerpt || ''}
              />
            )}
            
            {differences.seoTitle && (
              <ComparisonField
                label="SEO Title"
                value1={revision1.seoTitle || ''}
                value2={revision2.seoTitle || ''}
              />
            )}
            
            {differences.seoDescription && (
              <ComparisonField
                label="SEO Description"
                value1={revision1.seoDescription || ''}
                value2={revision2.seoDescription || ''}
              />
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ComparisonFieldProps {
  label: string;
  value1: string;
  value2: string;
  isLongText?: boolean;
}

const ComparisonField: React.FC<ComparisonFieldProps> = ({
  label,
  value1,
  value2,
  isLongText = false
}) => {
  return (
    <div>
      <h5 className="font-medium text-gray-900 dark:text-white mb-2">{label}</h5>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <div className="text-xs text-red-600 dark:text-red-400 mb-1">Previous</div>
          <div className={`text-sm text-gray-900 dark:text-white ${isLongText ? 'max-h-32 overflow-y-auto' : ''}`}>
            {value1 || <em className="text-gray-500">Empty</em>}
          </div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
          <div className="text-xs text-green-600 dark:text-green-400 mb-1">Current</div>
          <div className={`text-sm text-gray-900 dark:text-white ${isLongText ? 'max-h-32 overflow-y-auto' : ''}`}>
            {value2 || <em className="text-gray-500">Empty</em>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionHistory;
