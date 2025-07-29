import React from 'react';
import ScrollPerformanceTest from '../components/ScrollPerformanceTest';
import PostCard from '../components/PostCard';

// Mock data for testing
const mockPosts = Array.from({ length: 20 }, (_, i) => ({
  id: `test-${i}`,
  title: `Performance Test Post ${i + 1}`,
  slug: `performance-test-post-${i + 1}`,
  excerpt: `This is a test post excerpt for performance testing. It contains enough text to simulate real content and test how the optimizations affect scrolling performance with multiple cards on the page.`,
  content: `Full content for test post ${i + 1}`,
  imageUrl: `https://picsum.photos/400/300?random=${i}`,
  publishedAt: new Date().toISOString(),
  author: 'Performance Tester',
  category: 'Testing',
  tags: ['performance', 'testing', 'optimization'],
  readingTime: 5,
  isPublished: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}));

const ScrollPerformanceTestPage: React.FC = () => {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Scroll Performance Test Page
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page tests the scroll performance optimizations implemented in the blog. 
          Use the performance monitor below to measure FPS and frame drops while scrolling.
        </p>
      </div>

      <ScrollPerformanceTest />

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Performance Optimizations Applied
        </h2>
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>✅ <strong>Hardware Acceleration:</strong> Added will-change and transform3d properties</li>
            <li>✅ <strong>Optimized Transitions:</strong> Reduced duration and used specific properties instead of 'all'</li>
            <li>✅ <strong>Passive Event Listeners:</strong> Improved scroll responsiveness</li>
            <li>✅ <strong>Image Optimization:</strong> Added lazy loading and proper sizing attributes</li>
            <li>✅ <strong>Intersection Observer:</strong> Optimized with requestAnimationFrame batching</li>
            <li>✅ <strong>Mobile Optimizations:</strong> Enhanced touch-action and overscroll-behavior</li>
            <li>✅ <strong>CSS Containment:</strong> Added layout, style, and paint containment</li>
            <li>✅ <strong>Backdrop Filter:</strong> Reduced blur intensity for better performance</li>
          </ul>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Test Content - Scroll Through These Cards
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The cards below use the optimized PostCard component with hardware acceleration, 
          optimized transitions, and lazy-loaded images. Scroll through them while monitoring performance.
        </p>
      </div>

      {/* Test content with different variants */}
      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Default Gallery Cards
          </h3>
          <div className="grid gap-6">
            {mockPosts.slice(0, 6).map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Grid Layout Cards
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPosts.slice(6, 12).map(post => (
              <PostCard key={post.id} post={post} variant="grid" />
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            List Layout Cards
          </h3>
          <div className="space-y-6">
            {mockPosts.slice(12, 18).map(post => (
              <PostCard key={post.id} post={post} variant="list" />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Performance Testing Tips
        </h3>
        <ul className="text-blue-800 dark:text-blue-200 space-y-1 text-sm">
          <li>• Test on different devices (desktop, tablet, mobile)</li>
          <li>• Try different scroll speeds (slow, fast, momentum scrolling)</li>
          <li>• Test with browser dev tools throttling enabled</li>
          <li>• Compare performance before and after optimizations</li>
          <li>• Monitor for consistent 60 FPS during smooth scrolling</li>
        </ul>
      </div>
    </div>
  );
};

export default ScrollPerformanceTestPage;
