/**
 * Scroll Performance Optimization Utilities
 * 
 * This module provides utilities to optimize scrolling performance
 * by implementing passive event listeners, debouncing, and hardware acceleration hints.
 */

// Debounce utility for scroll events
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for high-frequency events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Optimized scroll event listener
export const addOptimizedScrollListener = (
  element: Element | Window,
  handler: EventListener,
  options: { passive?: boolean; throttle?: number } = {}
) => {
  const { passive = true, throttle: throttleMs = 16 } = options;
  
  const optimizedHandler = throttleMs > 0 
    ? throttle(handler, throttleMs)
    : handler;
  
  element.addEventListener('scroll', optimizedHandler, { passive });
  
  return () => {
    element.removeEventListener('scroll', optimizedHandler);
  };
};

// Hardware acceleration utilities
export const enableHardwareAcceleration = (element: HTMLElement) => {
  element.style.willChange = 'transform';
  element.style.transform = 'translateZ(0)';
};

export const disableHardwareAcceleration = (element: HTMLElement) => {
  element.style.willChange = 'auto';
  element.style.transform = '';
};

// Optimized intersection observer factory
export const createOptimizedIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  const optimizedCallback: IntersectionObserverCallback = (entries, observer) => {
    // Use requestAnimationFrame to batch DOM updates
    requestAnimationFrame(() => {
      callback(entries, observer);
    });
  };

  return new IntersectionObserver(optimizedCallback, {
    rootMargin: '0px',
    threshold: [0, 0.1, 0.5, 1.0],
    ...options
  });
};

// Smooth scroll utility with performance optimizations
export const smoothScrollTo = (
  element: Element,
  options: ScrollIntoViewOptions = {}
) => {
  requestAnimationFrame(() => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
      ...options
    });
  });
};

// Performance monitoring utilities
export const measureScrollPerformance = () => {
  let frameCount = 0;
  let lastTime = performance.now();
  
  const measureFrame = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
      console.log(`Scroll FPS: ${fps}`);
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(measureFrame);
  };
  
  requestAnimationFrame(measureFrame);
};

// CSS containment utility
export const enableContainment = (element: HTMLElement, types: string[] = ['layout', 'style', 'paint']) => {
  element.style.contain = types.join(' ');
};

// Touch action optimization
export const optimizeTouchAction = (element: HTMLElement, action: string = 'pan-y') => {
  element.style.touchAction = action;
};

// Overscroll behavior optimization
export const optimizeOverscroll = (element: HTMLElement, behavior: string = 'none') => {
  element.style.overscrollBehavior = behavior;
};
