
import React, { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { ChartBarIcon, DocumentTextIcon, TagIcon, ArrowLeftOnRectangleIcon, MenuIcon } from '../../components/icons.tsx';

const AdminLayout: React.FC = () => {
    const context = useContext(BlogContext);
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        context?.logout();
        navigate('/login');
    };

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive
            ? 'bg-primary text-light-text'
            : 'text-gray-400 hover:bg-medium-dark hover:text-light-text'
        }`;

    return (
        <div className="flex h-screen bg-light dark:bg-dark">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 bg-dark text-light-text rounded-md shadow-lg"
                    aria-label="Toggle sidebar"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-64 bg-dark text-light-text flex flex-col transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-4 sm:p-6 text-center border-b border-medium-dark">
                    <h1 className="text-xl sm:text-2xl font-bold text-light-text">GeminiBlog</h1>
                    <span className="text-sm text-primary">Admin Panel</span>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <NavLink 
                        to="/admin" 
                        end 
                        className={navLinkClasses}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <ChartBarIcon className="w-5 h-5 mr-3" /> Dashboard
                    </NavLink>
                    <NavLink 
                        to="/admin/posts" 
                        className={navLinkClasses}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <DocumentTextIcon className="w-5 h-5 mr-3" /> Posts
                    </NavLink>
                    <NavLink 
                        to="/admin/categories" 
                        className={navLinkClasses}
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <TagIcon className="w-5 h-5 mr-3" /> Categories & Tags
                    </NavLink>
                </nav>
                <div className="p-4 border-t border-medium-dark">
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded-lg text-gray-400 hover:bg-medium-dark hover:text-light-text transition-colors duration-200">
                        <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto lg:ml-0">
                <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
