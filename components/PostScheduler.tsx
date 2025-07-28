import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { schedulingService } from '../services/schedulingService';

interface PostSchedulerProps {
  post: Partial<Post>;
  onStatusChange: (status: Post['status'], scheduledAt?: Date) => void;
  className?: string;
}

const PostScheduler: React.FC<PostSchedulerProps> = ({
  post,
  onStatusChange,
  className = ''
}) => {
  const [selectedStatus, setSelectedStatus] = useState<Post['status']>(post.status || 'draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduleInfo, setScheduleInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (post.id) {
      loadScheduleInfo();
    }
  }, [post.id]);

  useEffect(() => {
    if (post.scheduledAt) {
      const scheduledDateTime = new Date(post.scheduledAt);
      setScheduledDate(scheduledDateTime.toISOString().split('T')[0]);
      setScheduledTime(scheduledDateTime.toTimeString().slice(0, 5));
    }
  }, [post.scheduledAt]);

  const loadScheduleInfo = async () => {
    if (!post.id) return;

    try {
      const info = await schedulingService.getPostScheduleInfo(post.id);
      setScheduleInfo(info);
    } catch (err) {
      console.error('Failed to load schedule info:', err);
    }
  };

  const handleStatusChange = (newStatus: Post['status']) => {
    setSelectedStatus(newStatus);
    setError(null);

    if (newStatus !== 'scheduled') {
      onStatusChange(newStatus);
    }
  };

  const handleScheduleSubmit = () => {
    if (selectedStatus !== 'scheduled') {
      onStatusChange(selectedStatus);
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time for scheduling');
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const validation = schedulingService.validateScheduleDate(scheduledDateTime);

    if (!validation.valid) {
      setError(validation.error || 'Invalid schedule date');
      return;
    }

    onStatusChange('scheduled', scheduledDateTime);
  };

  const getMinDateTime = () => {
    const now = new Date();
    const minDate = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
    return {
      date: minDate.toISOString().split('T')[0],
      time: minDate.toTimeString().slice(0, 5)
    };
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // 1 year from now
    return maxDate.toISOString().split('T')[0];
  };

  const availableStatuses = post.status 
    ? schedulingService.getAvailableStatusTransitions(post.status)
    : ['draft', 'published', 'scheduled', 'private'];

  const minDateTime = getMinDateTime();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Publishing Options
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Current Status */}
      {post.status && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Status:</span>
            <span className={`px-2 py-1 text-xs rounded-full ${schedulingService.getStatusColor(post.status)}`}>
              {schedulingService.getStatusDisplayName(post.status)}
            </span>
          </div>
          
          {scheduleInfo?.isScheduled && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              Scheduled for: {scheduleInfo.scheduledAt?.toLocaleString()}
              {scheduleInfo.attempts > 0 && (
                <span className="ml-2 text-red-600 dark:text-red-400">
                  (Failed attempts: {scheduleInfo.attempts})
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Status Selection */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Change Status To:
          </label>
          <div className="space-y-2">
            {availableStatuses.map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={(e) => handleStatusChange(e.target.value as Post['status'])}
                  className="mr-3"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {schedulingService.getStatusDisplayName(status)}
                </span>
                {status === 'scheduled' && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    (Set date and time below)
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Schedule Date/Time */}
        {selectedStatus === 'scheduled' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
              Schedule Publishing
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={minDateTime.date}
                  max={getMaxDate()}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-700 dark:text-blue-300">
              Posts can be scheduled at least 5 minutes in advance and up to 1 year in the future.
            </p>
          </div>
        )}

        {/* Status Descriptions */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>Draft:</strong> Save as draft for later editing</p>
          <p><strong>Published:</strong> Make immediately visible to visitors</p>
          <p><strong>Scheduled:</strong> Automatically publish at specified date/time</p>
          <p><strong>Private:</strong> Only visible to administrators</p>
          {post.status === 'published' && (
            <>
              <p><strong>Archived:</strong> Remove from public view but keep accessible</p>
              <p><strong>Trash:</strong> Move to trash (can be restored later)</p>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={handleScheduleSubmit}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Updating...' : `Update to ${schedulingService.getStatusDisplayName(selectedStatus)}`}
          </button>
        </div>
      </div>

      {/* Publishing History */}
      {post.createdAt && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Publishing History
          </h4>
          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            <p>Created: {new Date(post.createdAt).toLocaleString()}</p>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <p>Last Modified: {new Date(post.updatedAt).toLocaleString()}</p>
            )}
            {post.publishedAt && (
              <p>Published: {new Date(post.publishedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostScheduler;
