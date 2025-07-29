import React, { Suspense } from 'react';

// Lazy load the heavy recharts library
const AnalyticsChart = React.lazy(() => import('./AnalyticsChart'));

const ChartLoadingFallback: React.FC = () => (
  <div className="bg-light dark:bg-dark p-6 rounded-lg shadow-md h-96 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground text-sm">Loading analytics chart...</p>
    </div>
  </div>
);

const LazyAnalyticsChart: React.FC = () => {
  return (
    <Suspense fallback={<ChartLoadingFallback />}>
      <AnalyticsChart />
    </Suspense>
  );
};

export default LazyAnalyticsChart;
