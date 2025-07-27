
import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { BlogContext } from './context/SupabaseBlogContext';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './pages/public/HomePage';
import PostPage from './pages/public/PostPage';
import CategoryPage from './pages/public/CategoryPage';
import LoginPage from './pages/admin/LoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import PostListPage from './pages/admin/PostListPage';
import PostEditorPage from './pages/admin/PostEditorPage';
import CategoryManagerPage from './pages/admin/CategoryManagerPage';
import Header from './components/Header';

const ProtectedRoute: React.FC = () => {
  const context = useContext(BlogContext);
  if (!context) {
    return <Navigate to="/login" />;
  }
  const { isAdmin } = context;
  return isAdmin ? <Outlet /> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="posts" element={<PostListPage />} />
            <Route path="posts/new" element={<PostEditorPage />} />
            <Route path="posts/edit/:id" element={<PostEditorPage />} />
            <Route path="categories" element={<CategoryManagerPage />} />
          </Route>
        </Route>

        <Route path="/*" element={
            <div className="bg-white font-sans text-gray-800">
                <Header />
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/post/:slug" element={<PostPage />} />
                        <Route path="/category/:slug" element={<CategoryPage />} />
                    </Routes>
                </div>
                
                {/* Cookie Banner */}
                <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50">
                    <div className="max-w-screen-xl mx-auto flex justify-between items-center">
                        <div className="text-sm text-gray-300">
                            We use cookies to enhance your browsing experience and provide personalized content.
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors">
                                Cookie Settings
                            </button>
                            <button className="px-3 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors">
                                Deny
                            </button>
                            <button className="px-4 py-2 bg-white text-black text-sm rounded-md hover:bg-gray-100 transition-colors">
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        } />
      </Routes>
    </ThemeProvider>
  );
};

export default App;