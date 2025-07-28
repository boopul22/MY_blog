
import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  ChartBarIcon,
  DocumentTextIcon,
  TagIcon,
  ArrowLeftOnRectangleIcon,
  MenuIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '../../components/icons.tsx';

const AdminLayout: React.FC = () => {
    const context = useContext(BlogContext);
    const navigate = useNavigate();
    const { isCollapsed, isMobileOpen, toggleCollapsed, setMobileOpen, closeMobile } = useSidebar();

    const handleLogout = () => {
        context?.logout();
        navigate('/login');
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-3 md:py-4 lg:py-3 rounded-lg transition-colors duration-200 text-sm md:text-base xl:text-sm ${
        isActive
            ? 'bg-primary text-light-text'
            : 'text-gray-400 hover:bg-medium-dark hover:text-light-text'
        } ${isCollapsed ? 'xl:justify-center xl:px-2' : ''}`;

    return (
        <div className="flex h-screen bg-light dark:bg-dark overflow-hidden">
            {/* Mobile Menu Button */}
            <div className="xl:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(!isMobileOpen)}
                    className="p-3 bg-dark text-light-text rounded-lg shadow-lg hover:bg-gray-800 transition-colors duration-200 md:p-2"
                    aria-label="Toggle sidebar"
                >
                    <MenuIcon className="w-6 h-6 md:w-5 md:h-5" />
                </button>
            </div>

            {/* Desktop Collapse Toggle */}
            <div className="hidden xl:block fixed top-4 left-4 z-50">
                <button
                    onClick={toggleCollapsed}
                    className="p-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="w-5 h-5" />
                    ) : (
                        <ChevronLeftIcon className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed xl:static inset-y-0 left-0 z-50 bg-dark text-light-text flex flex-col transform transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
                ${isCollapsed ? 'xl:w-16' : 'xl:w-64'}
                w-64 md:w-72 lg:w-80 xl:w-64
            `}>
                <div className={`p-4 text-center border-b border-medium-dark transition-all duration-300 ${isCollapsed ? 'xl:px-2' : 'md:p-6'}`}>
                    {!isCollapsed && (
                        <>
                            <h1 className="text-xl md:text-2xl lg:text-3xl xl:text-2xl font-bold text-light-text">GeminiBlog</h1>
                            <span className="text-sm md:text-base xl:text-sm text-primary">Admin Panel</span>
                        </>
                    )}
                    {isCollapsed && (
                        <div className="hidden xl:block">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
                                <span className="text-white font-bold text-sm">GB</span>
                            </div>
                        </div>
                    )}
                </div>
                <nav className="flex-grow p-4 md:p-6 xl:p-4 space-y-2 md:space-y-3 xl:space-y-2">
                    <NavLink
                        to="/admin"
                        end
                        className={navLinkClasses}
                        onClick={closeMobile}
                        title={isCollapsed ? "Dashboard" : ""}
                    >
                        <ChartBarIcon className="w-5 h-5 md:w-6 md:h-6 xl:w-5 xl:h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3 md:ml-4 xl:ml-3">Dashboard</span>}
                    </NavLink>
                    <NavLink
                        to="/admin/posts"
                        className={navLinkClasses}
                        onClick={closeMobile}
                        title={isCollapsed ? "Posts" : ""}
                    >
                        <DocumentTextIcon className="w-5 h-5 md:w-6 md:h-6 xl:w-5 xl:h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3 md:ml-4 xl:ml-3">Posts</span>}
                    </NavLink>
                    <NavLink
                        to="/admin/categories"
                        className={navLinkClasses}
                        onClick={closeMobile}
                        title={isCollapsed ? "Categories & Tags" : ""}
                    >
                        <TagIcon className="w-5 h-5 md:w-6 md:h-6 xl:w-5 xl:h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3 md:ml-4 xl:ml-3">Categories & Tags</span>}
                    </NavLink>
                </nav>
                <div className="p-4 md:p-6 xl:p-4 border-t border-medium-dark">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center px-4 py-3 md:py-4 xl:py-3 rounded-lg text-gray-400 hover:bg-medium-dark hover:text-light-text transition-colors duration-200 text-sm md:text-base xl:text-sm ${isCollapsed ? 'xl:justify-center' : ''}`}
                        title={isCollapsed ? "Logout" : ""}
                    >
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 md:w-6 md:h-6 xl:w-5 xl:h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="ml-3 md:ml-4 xl:ml-3">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 overflow-hidden transition-all duration-300 ${isCollapsed ? 'xl:ml-16' : 'xl:ml-64'} xl:ml-0`}>
                <div className="h-full overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8 xl:p-6 pt-16 xl:pt-8 min-h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
