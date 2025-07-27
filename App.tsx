
import React, { useContext, useState, useEffect } from 'react';
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

// Cookie consent types
type CookieConsent = 'accepted' | 'denied' | 'partial' | null;

interface CookieSettings {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const App: React.FC = () => {
  const [showCookieBanner, setShowCookieBanner] = useState<boolean>(false);
  const [showCookieSettings, setShowCookieSettings] = useState<boolean>(false);
  const [cookieSettings, setCookieSettings] = useState<CookieSettings>({
    necessary: true,
    analytics: false,
    marketing: false
  });

  // Check for existing cookie consent on component mount
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowCookieBanner(true);
    } else {
      // Load saved settings if they exist
      const savedSettings = localStorage.getItem('cookieSettings');
      if (savedSettings) {
        setCookieSettings(JSON.parse(savedSettings));
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAcceptedSettings = {
      necessary: true,
      analytics: true,
      marketing: true
    };
    setCookieSettings(allAcceptedSettings);
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieSettings', JSON.stringify(allAcceptedSettings));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
  };

  const handleDeny = () => {
    const deniedSettings = {
      necessary: true,
      analytics: false,
      marketing: false
    };
    setCookieSettings(deniedSettings);
    localStorage.setItem('cookieConsent', 'denied');
    localStorage.setItem('cookieSettings', JSON.stringify(deniedSettings));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
  };

  const handleSaveSettings = () => {
    const hasNonNecessary = cookieSettings.analytics || cookieSettings.marketing;
    const consentType = hasNonNecessary ? 'partial' : 'denied';
    localStorage.setItem('cookieConsent', consentType);
    localStorage.setItem('cookieSettings', JSON.stringify(cookieSettings));
    setShowCookieBanner(false);
    setShowCookieSettings(false);
  };

  const toggleCookieSetting = (key: keyof CookieSettings) => {
    if (key === 'necessary') return; // Necessary cookies cannot be disabled
    setCookieSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

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
                {showCookieBanner && (
                  <div className="fixed bottom-0 left-0 right-0 bg-black text-white p-4 z-50 shadow-lg">
                    <div className="max-w-screen-xl mx-auto">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <div className="text-sm text-gray-300 flex-1">
                          We use cookies to enhance your browsing experience and provide personalized content. 
                          You can choose which cookies to accept.
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
                          <button 
                            onClick={() => setShowCookieSettings(true)}
                            className="px-4 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors whitespace-nowrap"
                          >
                            Cookie Settings
                          </button>
                          <button 
                            onClick={handleDeny}
                            className="px-3 py-2 bg-gray-700 text-white text-sm rounded-md hover:bg-gray-600 transition-colors whitespace-nowrap"
                          >
                            Deny
                          </button>
                          <button 
                            onClick={handleAcceptAll}
                            className="px-4 py-2 bg-white text-black text-sm rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
                          >
                            Accept All
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Cookie Settings Modal */}
                {showCookieSettings && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Cookie Settings</h2>
                        <p className="text-sm text-gray-600 mb-6">
                          Choose which cookies you want to accept. Necessary cookies are required for the website to function properly.
                        </p>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h3 className="font-medium text-gray-900">Necessary Cookies</h3>
                              <p className="text-sm text-gray-600">Required for basic website functionality</p>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox" 
                                checked={cookieSettings.necessary}
                                disabled
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h3 className="font-medium text-gray-900">Analytics Cookies</h3>
                              <p className="text-sm text-gray-600">Help us understand how visitors use our website</p>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox" 
                                checked={cookieSettings.analytics}
                                onChange={() => toggleCookieSetting('analytics')}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <h3 className="font-medium text-gray-900">Marketing Cookies</h3>
                              <p className="text-sm text-gray-600">Used to deliver personalized advertisements</p>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="checkbox" 
                                checked={cookieSettings.marketing}
                                onChange={() => toggleCookieSetting('marketing')}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                          <button 
                            onClick={() => setShowCookieSettings(false)}
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleSaveSettings}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Save Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
        } />
      </Routes>
    </ThemeProvider>
  );
};

export default App;