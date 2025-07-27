
import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { ChartBarIcon, DocumentTextIcon, TagIcon, ArrowLeftOnRectangleIcon } from '../../components/icons';

const AdminLayout: React.FC = () => {
    const context = useContext(BlogContext);
    const navigate = useNavigate();

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
            <aside className="w-64 bg-dark text-light-text flex flex-col">
                <div className="p-6 text-center border-b border-medium-dark">
                    <h1 className="text-2xl font-bold text-light-text">GeminiBlog</h1>
                    <span className="text-sm text-primary">Admin Panel</span>
                </div>
                <nav className="flex-grow p-4 space-y-2">
                    <NavLink to="/admin" end className={navLinkClasses}>
                        <ChartBarIcon className="w-5 h-5 mr-3" /> Dashboard
                    </NavLink>
                    <NavLink to="/admin/posts" className={navLinkClasses}>
                        <DocumentTextIcon className="w-5 h-5 mr-3" /> Posts
                    </NavLink>
                    <NavLink to="/admin/categories" className={navLinkClasses}>
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
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
