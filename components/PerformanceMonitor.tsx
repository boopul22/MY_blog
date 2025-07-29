import React, { useState, useEffect } from 'react';
import { performanceMonitor } from '../services/performanceMonitoring';

interface CoreWebVitals {
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
}

interface PerformanceMonitorProps {
  embedded?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ embedded = false }) => {
  const [metrics, setMetrics] = useState<CoreWebVitals>({});
  const [isVisible, setIsVisible] = useState(embedded);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = performanceMonitor.getCurrentMetrics();
      setMetrics(currentMetrics);
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (metric: string, value: number): string => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 600, poor: 1500 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-500';

    if (value <= threshold.good) return 'text-green-600';
    if (value <= threshold.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatValue = (metric: string, value: number): string => {
    if (metric === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  const getScoreLabel = (metric: string, value: number): string => {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 600, poor: 1500 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return '';

    if (value <= threshold.good) return 'Good';
    if (value <= threshold.poor) return 'Needs Improvement';
    return 'Poor';
  };

  if (!embedded && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        📊 Performance
      </button>
    );
  }

  const containerClass = embedded
    ? "bg-transparent"
    : "fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm z-50";

  return (
    <div className={containerClass}>
      {!embedded && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Core Web Vitals</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      <div className="space-y-2 text-sm">
        {Object.entries(metrics).map(([metric, value]) => (
          <div key={metric} className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">{metric}:</span>
            <div className="text-right">
              <span className={`font-medium ${getScoreColor(metric, value)}`}>
                {formatValue(metric, value)}
              </span>
              <div className={`text-xs ${getScoreColor(metric, value)}`}>
                {getScoreLabel(metric, value)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(metrics).length === 0 && (
        <div className="text-muted-foreground text-sm">
          Collecting metrics...
        </div>
      )}

      {!embedded && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Performance monitoring active
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
