
import React from 'react';
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
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import PostListPage from './pages/admin/PostListPage';
import PostEditorPage from './pages/admin/PostEditorPage';
import CategoryManagerPage from './pages/admin/CategoryManagerPage';
import EditorTestPage from './pages/admin/EditorTestPage';
import Sitemap from './pages/Sitemap';
import Header from './components/Header';
import Footer from './components/Footer';
import Breadcrumbs from './components/Breadcrumbs';

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
          <div className="min-h-screen bg-light dark:bg-dark transition-colors duration-200 flex flex-col">
            <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="posts" element={<PostListPage />} />
              <Route path="posts/new" element={<PostEditorPage />} />
              <Route path="posts/edit/:id" element={<PostEditorPage />} />
              <Route path="categories" element={<CategoryManagerPage />} />
              <Route path="test-editor" element={<EditorTestPage />} />
            </Route>
          </Route>

          <Route path="/*" element={
              <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1">
                    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                        <Breadcrumbs />
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/post" element={<Navigate to="/all-posts" replace />} />
                            <Route path="/post/:slug" element={<PostPage />} />
                            <Route path="/category/:slug" element={<CategoryPage />} />
                            <Route path="/all-posts" element={<AllPostsPage />} />
                            <Route path="/sitemap.xml" element={<Sitemap />} />
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
