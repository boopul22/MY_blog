import React, { useState, useEffect } from 'react';
import { ScheduledPost } from '../types';
import { schedulingService } from '../services/schedulingService';

const ScheduledPostsDashboard: React.FC = () => {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'published' | 'failed'>('all');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    loadScheduledPosts();
  }, [filter]);

  const loadScheduledPosts = async () => {
    try {
      setIsLoading(true);
      const { scheduledPosts: posts } = await schedulingService.getScheduledPosts({
        status: filter === 'all' ? undefined : filter as any,
        limit: 50
      });
      setScheduledPosts(posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scheduled posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishNow = async () => {
    try {
      setIsPublishing(true);
      const result = await schedulingService.publishScheduledPosts();
      
      if (result.published > 0) {
        await loadScheduledPosts();
        alert(`Successfully published ${result.published} post(s)`);
      } else {
        alert('No posts were ready for publishing');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish posts');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnschedule = async (postId: string) => {
    if (!confirm('Are you sure you want to unschedule this post?')) {
      return;
    }

    try {
      await schedulingService.unschedulePost(postId);
      await loadScheduledPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unschedule post');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getTimeUntilPublish = (scheduledAt: string) => {
    const now = new Date();
    const scheduled = new Date(scheduledAt);
    const diff = scheduled.getTime() - now.getTime();

    if (diff <= 0) {
      return 'Overdue';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Scheduled Posts
        </h2>
        <div className="flex space-x-3">
          <button
            onClick={handlePublishNow}
            disabled={isPublishing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isPublishing ? 'Publishing...' : 'Publish Ready Posts'}
          </button>
          <button
            onClick={loadScheduledPosts}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {(['all', 'pending', 'published', 'failed'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              filter === filterOption
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Scheduled Posts List */}
      {scheduledPosts.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No scheduled posts found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {scheduledPosts.map((scheduledPost) => (
            <ScheduledPostCard
              key={scheduledPost.id}
              scheduledPost={scheduledPost}
              onUnschedule={() => handleUnschedule(scheduledPost.postId)}
              getStatusColor={getStatusColor}
              getTimeUntilPublish={getTimeUntilPublish}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface ScheduledPostCardProps {
  scheduledPost: ScheduledPost;
  onUnschedule: () => void;
  getStatusColor: (status: string) => string;
  getTimeUntilPublish: (scheduledAt: string) => string;
}

const ScheduledPostCard: React.FC<ScheduledPostCardProps> = ({
  scheduledPost,
  onUnschedule,
  getStatusColor,
  getTimeUntilPublish
}) => {
  const [postDetails, setPostDetails] = useState<any>(null);

  useEffect(() => {
    // In a real implementation, you'd fetch post details here
    // For now, we'll use placeholder data
    setPostDetails({
      title: `Post ${scheduledPost.postId.slice(0, 8)}`,
      slug: `post-${scheduledPost.postId.slice(0, 8)}`
    });
  }, [scheduledPost.postId]);

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {postDetails?.title || 'Loading...'}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scheduledPost.status)}`}>
              {scheduledPost.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Scheduled:</span>
              <br />
              {new Date(scheduledPost.scheduledAt).toLocaleString()}
            </div>
            
            <div>
              <span className="font-medium">Time Until Publish:</span>
              <br />
              <span className={`font-medium ${
                getTimeUntilPublish(scheduledPost.scheduledAt) === 'Overdue' 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-blue-600 dark:text-blue-400'
              }`}>
                {getTimeUntilPublish(scheduledPost.scheduledAt)}
              </span>
            </div>

            <div>
              <span className="font-medium">Attempts:</span>
              <br />
              {scheduledPost.attempts}
              {scheduledPost.attempts > 0 && (
                <span className="ml-2 text-red-600 dark:text-red-400">
                  (Last: {scheduledPost.lastAttemptAt ? new Date(scheduledPost.lastAttemptAt).toLocaleString() : 'N/A'})
                </span>
              )}
            </div>
          </div>

          {scheduledPost.errorMessage && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Error:</strong> {scheduledPost.errorMessage}
              </p>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {scheduledPost.status === 'pending' && (
            <button
              onClick={onUnschedule}
              className="px-3 py-1 text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
            >
              Unschedule
            </button>
          )}
          <a
            href={`/admin/posts/${scheduledPost.postId}/edit`}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Edit
          </a>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPostsDashboard;
