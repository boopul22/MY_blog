module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:4173/', // Homepage
        'http://localhost:4173/all-posts', // All posts page
        'http://localhost:4173/category/technology', // Category page (if exists)
      ],
      // Number of runs per URL
      numberOfRuns: 3,
      // Settings for the collection
      settings: {
        // Use desktop settings for consistent testing
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0,
        },
        // Skip certain audits that aren't relevant
        skipAudits: [
          'canonical',
          'robots-txt',
          'tap-targets',
          'content-width',
        ],
      },
    },
    assert: {
      // Performance budgets and assertions
      assertions: {
        // Core Web Vitals thresholds
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'speed-index': ['error', { maxNumericValue: 3400 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        
        // Performance score
        'categories:performance': ['error', { minScore: 0.9 }],
        
        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.95 }],
        
        // Best practices
        'categories:best-practices': ['error', { minScore: 0.9 }],
        
        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Resource optimization
        'unused-javascript': ['warn', { maxNumericValue: 100000 }], // 100KB
        'unused-css-rules': ['warn', { maxNumericValue: 50000 }], // 50KB
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        'unminified-css': ['error', { maxNumericValue: 0 }],
        'unminified-javascript': ['error', { maxNumericValue: 0 }],
        
        // Image optimization
        'modern-image-formats': ['warn', { maxNumericValue: 50000 }],
        'uses-optimized-images': ['warn', { maxNumericValue: 50000 }],
        'uses-responsive-images': ['warn', { maxNumericValue: 50000 }],
        
        // Network optimization
        'uses-text-compression': ['error', { maxNumericValue: 0 }],
        'uses-rel-preconnect': ['warn', { maxNumericValue: 500 }],
        'uses-rel-preload': ['warn', { maxNumericValue: 500 }],
      },
    },
    upload: {
      // Store results locally for now
      target: 'filesystem',
      outputDir: './lighthouse-results',
    },
  },
};
