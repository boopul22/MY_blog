import React, { useEffect, useState, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  scrollEvents: number;
  frameDrops: number;
  averageFrameTime: number;
}

const ScrollPerformanceTest: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    scrollEvents: 0,
    frameDrops: 0,
    averageFrameTime: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const metricsRef = useRef<PerformanceMetrics>(metrics);
  const frameTimesRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  const startMonitoring = () => {
    setIsMonitoring(true);
    frameTimesRef.current = [];
    lastFrameTimeRef.current = performance.now();
    
    // Reset metrics
    const initialMetrics = { fps: 0, scrollEvents: 0, frameDrops: 0, averageFrameTime: 0 };
    setMetrics(initialMetrics);
    metricsRef.current = initialMetrics;

    // Monitor frame rate
    const measureFrameRate = () => {
      const currentTime = performance.now();
      const frameTime = currentTime - lastFrameTimeRef.current;
      frameTimesRef.current.push(frameTime);
      
      // Keep only last 60 frames for rolling average
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }
      
      const averageFrameTime = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length;
      const fps = Math.round(1000 / averageFrameTime);
      const frameDrops = frameTimesRef.current.filter(time => time > 16.67).length; // 60fps = 16.67ms per frame
      
      setMetrics(prev => ({
        ...prev,
        fps,
        averageFrameTime: Math.round(averageFrameTime * 100) / 100,
        frameDrops
      }));
      
      lastFrameTimeRef.current = currentTime;
      
      if (isMonitoring) {
        animationFrameRef.current = requestAnimationFrame(measureFrameRate);
      }
    };
    
    animationFrameRef.current = requestAnimationFrame(measureFrameRate);

    // Monitor scroll events
    let scrollEventCount = 0;
    const handleScroll = () => {
      scrollEventCount++;
      setMetrics(prev => ({
        ...prev,
        scrollEvents: scrollEventCount
      }));
    };

    // Use passive listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const getPerformanceRating = (fps: number) => {
    if (fps >= 55) return { rating: 'Excellent', color: 'text-green-600' };
    if (fps >= 45) return { rating: 'Good', color: 'text-blue-600' };
    if (fps >= 30) return { rating: 'Fair', color: 'text-yellow-600' };
    return { rating: 'Poor', color: 'text-red-600' };
  };

  const performanceRating = getPerformanceRating(metrics.fps);

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
        🚀 Scroll Performance Monitor
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded">
          <div className="text-sm text-gray-600 dark:text-gray-400">FPS</div>
          <div className={`text-xl font-bold ${performanceRating.color}`}>
            {metrics.fps}
          </div>
          <div className={`text-xs ${performanceRating.color}`}>
            {performanceRating.rating}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded">
          <div className="text-sm text-gray-600 dark:text-gray-400">Scroll Events</div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {metrics.scrollEvents}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded">
          <div className="text-sm text-gray-600 dark:text-gray-400">Frame Drops</div>
          <div className={`text-xl font-bold ${metrics.frameDrops > 5 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.frameDrops}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded">
          <div className="text-sm text-gray-600 dark:text-gray-400">Avg Frame Time</div>
          <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {metrics.averageFrameTime}ms
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={startMonitoring}
          disabled={isMonitoring}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isMonitoring ? 'Monitoring...' : 'Start Monitoring'}
        </button>
        
        <button
          onClick={stopMonitoring}
          disabled={!isMonitoring}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop Monitoring
        </button>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p><strong>Instructions:</strong> Click "Start Monitoring" and then scroll the page to test performance.</p>
        <p><strong>Target:</strong> 60 FPS with minimal frame drops for smooth scrolling.</p>
      </div>
    </div>
  );
};

export default ScrollPerformanceTest;
