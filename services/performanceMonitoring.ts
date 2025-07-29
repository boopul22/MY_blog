/**
 * Performance Monitoring Service
 * Tracks Core Web Vitals and other performance metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  url: string;
}

interface CoreWebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private coreWebVitals: CoreWebVitals = {};

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.observeTTFB();

    // Send metrics when page is about to unload
    window.addEventListener('beforeunload', () => {
      this.sendMetrics();
    });

    // Send metrics periodically
    setInterval(() => {
      this.sendMetrics();
    }, 30000); // Every 30 seconds
  }

  private observeLCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
        this.coreWebVitals.LCP = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private observeFID() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
          this.coreWebVitals.FID = entry.processingStart - entry.startTime;
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private observeCLS() {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.recordMetric('CLS', clsValue);
        this.coreWebVitals.CLS = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  private observeFCP() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.recordMetric('FCP', entry.startTime);
            this.coreWebVitals.FCP = entry.startTime;
          }
        });
      });
      observer.observe({ entryTypes: ['paint'] });
    }
  }

  private observeTTFB() {
    if ('performance' in window && 'timing' in performance) {
      window.addEventListener('load', () => {
        const timing = performance.timing;
        const ttfb = timing.responseStart - timing.navigationStart;
        this.recordMetric('TTFB', ttfb);
        this.coreWebVitals.TTFB = ttfb;
      });
    }
  }

  private recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
    };
    this.metrics.push(metric);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Performance Metric: ${name} = ${value.toFixed(2)}ms`);
    }

    // Check against performance budgets
    this.checkPerformanceBudgets(name, value);
  }

  private checkPerformanceBudgets(name: string, value: number) {
    const budgets = {
      LCP: 2500, // 2.5 seconds
      FID: 100,  // 100ms
      CLS: 0.1,  // 0.1
      FCP: 1800, // 1.8 seconds
      TTFB: 600, // 600ms
    };

    const budget = budgets[name as keyof typeof budgets];
    if (budget && value > budget) {
      console.warn(`⚠️ Performance Budget Exceeded: ${name} = ${value.toFixed(2)} (budget: ${budget})`);
      
      // In production, you might want to send alerts
      if (process.env.NODE_ENV === 'production') {
        this.sendAlert(name, value, budget);
      }
    }
  }

  private sendAlert(metric: string, value: number, budget: number) {
    // Implement alerting logic here
    // Could send to analytics service, logging service, etc.
    console.error(`🚨 Performance Alert: ${metric} exceeded budget by ${((value / budget - 1) * 100).toFixed(1)}%`);
  }

  private sendMetrics() {
    if (this.metrics.length === 0) return;

    // In a real application, send to analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('📈 Core Web Vitals Summary:', this.coreWebVitals);
    }

    // Clear sent metrics
    this.metrics = [];
  }

  // Public method to get current metrics
  public getCurrentMetrics(): CoreWebVitals {
    return { ...this.coreWebVitals };
  }

  // Public method to manually record custom metrics
  public recordCustomMetric(name: string, value: number) {
    this.recordMetric(name, value);
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;
