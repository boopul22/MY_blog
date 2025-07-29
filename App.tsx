
import React, { Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { BlogContext } from './context/SupabaseBlogContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationProvider';
import { SidebarProvider } from './context/SidebarContext';
import NotificationContainer from './components/NotificationContainer';
import HomePage from './pages/public/HomePage';
import PostPage from './pages/public/PostPage';
import CategoryPage from './pages/public/CategoryPage';
import AllPostsPage from './pages/public/AllPostsPage';
import MobileReadingDemo from './pages/public/MobileReadingDemo';
import LoginPage from './pages/admin/LoginPage';
import Header from './components/Header';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs';
import { useLocation } from 'react-router-dom';

// Lazy load admin components to reduce main bundle size
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = React.lazy(() => import('./pages/admin/DashboardPage'));
const PostListPage = React.lazy(() => import('./pages/admin/PostListPage'));
const PostEditorPage = React.lazy(() => import('./pages/admin/PostEditorPage'));
const CategoryManagerPage = React.lazy(() => import('./pages/admin/CategoryManagerPage'));
const EditorTestPage = React.lazy(() => import('./pages/admin/EditorTestPage'));

// Lazy load debug/test pages
const EditorDebugPage = React.lazy(() => import('./pages/EditorDebugPage'));
const ScrollPerformanceTestPage = React.lazy(() => import('./pages/ScrollPerformanceTestPage'));
const Sitemap = React.lazy(() => import('./pages/Sitemap'));

const ConditionalBreadcrumbs: React.FC = () => {
  const location = useLocation();
  // Don't show breadcrumbs on PostPage as it has its own aligned breadcrumbs
  if (location.pathname.startsWith('/post/')) {
    return null;
  }
  return <Breadcrumbs />;
};

const LazyLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-96">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC = () => {
  const context = React.useContext(BlogContext);
  if (!context) {
    return <Navigate to="/login" />;
  }
  const { isAdmin } = context;
  return isAdmin ? <Outlet /> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-light dark:bg-dark transition-colors duration-200 flex flex-col scroll-container" style={{contain: 'layout style paint'}}>
            <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={
              <Suspense fallback={<LazyLoadingFallback />}>
                <AdminLayout />
              </Suspense>
            }>
              <Route index element={
                <Suspense fallback={<LazyLoadingFallback />}>
                  <DashboardPage />
                </Suspense>
              } />
              <Route path="posts" element={
                <Suspense fallback={<LazyLoadingFallback />}>
                  <PostListPage />
                </Suspense>
              } />
              <Route path="posts/new" element={
                <Suspense fallback={<LazyLoadingFallback />}>
                  <PostEditorPage />
                </Suspense>
              } />
              <Route path="posts/edit/:id" element={
                <Suspense fallback={<LazyLoadingFallback />}>
                  <PostEditorPage />
                </Suspense>
              } />
              <Route path="categories" element={
                <Suspense fallback={<LazyLoadingFallback />}>
                  <CategoryManagerPage />
                </Suspense>
              } />
              <Route path="test-editor" element={
                <Suspense fallback={<LazyLoadingFallback />}>
                  <EditorTestPage />
                </Suspense>
              } />
            </Route>
          </Route>

          <Route path="/*" element={
              <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1" style={{contain: 'layout style paint', transform: 'translateZ(0)'}}>
                    <div className="md:max-w-screen-xl md:mx-auto md:px-4 sm:md:px-6 lg:md:px-8 md:pt-4">
                        <ConditionalBreadcrumbs />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/post" element={<Navigate to="/all-posts" replace />} />
                            <Route path="/post/:slug" element={<PostPage />} />
                            <Route path="/category/:slug" element={<CategoryPage />} />
                            <Route path="/all-posts" element={<AllPostsPage />} />
                            <Route path="/mobile-demo" element={<MobileReadingDemo />} />
                            <Route path="/editor-debug" element={
                              <Suspense fallback={<LazyLoadingFallback />}>
                                <EditorDebugPage />
                              </Suspense>
                            } />
                            <Route path="/performance-test" element={
                              <Suspense fallback={<LazyLoadingFallback />}>
                                <ScrollPerformanceTestPage />
                              </Suspense>
                            } />
                            <Route path="/sitemap.xml" element={
                              <Suspense fallback={<LazyLoadingFallback />}>
                                <Sitemap />
                              </Suspense>
                            } />
                        </Routes>
                    </div>
                  </main>
                  <Footer />
              </div>
          } />
            </Routes>
            <NotificationContainer />
          </div>
        </SidebarProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
