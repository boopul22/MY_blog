
import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { useSidebar } from '../../context/SidebarContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
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
        cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/70",
            isCollapsed && "justify-center px-2"
        );

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Mobile Menu Button */}
            <div className="xl:hidden fixed top-3 left-3 z-50">
                <Button
                    variant="default"
                    size="icon"
                    onClick={() => setMobileOpen(!isMobileOpen)}
                    className="bg-sidebar text-sidebar-foreground hover:bg-sidebar-accent shadow-lg"
                >
                    <MenuIcon className="h-5 w-5" />
                </Button>
            </div>

            {/* Desktop Collapse Toggle */}
            <div className="hidden xl:block fixed top-3 left-3 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleCollapsed}
                    className="h-8 w-8 shadow-sm"
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="h-4 w-4" />
                    ) : (
                        <ChevronLeftIcon className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="xl:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={closeMobile}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed xl:static inset-y-0 left-0 z-50 bg-sidebar border-r border-sidebar-border flex flex-col transform transition-all duration-300 ease-in-out",
                isMobileOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0",
                isCollapsed ? "xl:w-16" : "xl:w-56",
                "w-56"
            )}>
                <div className={cn(
                    "p-4 border-b border-sidebar-border transition-all duration-300",
                    isCollapsed ? "xl:px-2" : ""
                )}>
                    {!isCollapsed && (
                        <div className="text-center">
                            <h1 className="text-lg font-bold text-sidebar-foreground">GeminiBlog</h1>
                            <span className="text-xs text-sidebar-primary">Admin Panel</span>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="hidden xl:flex justify-center">
                            <div className="w-8 h-8 bg-sidebar-primary rounded-md flex items-center justify-center">
                                <span className="text-sidebar-primary-foreground font-bold text-sm">GB</span>
                            </div>
                        </div>
                    )}
                </div>
                <nav className="flex-grow p-3 space-y-1">
                    <NavLink
                        to="/admin"
                        end
                        className={navLinkClasses}
                        onClick={closeMobile}
                        title={isCollapsed ? "Dashboard" : ""}
                    >
                        <ChartBarIcon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink
                        to="/admin/posts"
                        className={navLinkClasses}
                        onClick={closeMobile}
                        title={isCollapsed ? "Posts" : ""}
                    >
                        <DocumentTextIcon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Posts</span>}
                    </NavLink>
                    <NavLink
                        to="/admin/categories"
                        className={navLinkClasses}
                        onClick={closeMobile}
                        title={isCollapsed ? "Categories & Tags" : ""}
                    >
                        <TagIcon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Categories & Tags</span>}
                    </NavLink>
                </nav>
                <Separator />
                <div className="p-3">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className={cn(
                            "w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? "Logout" : ""}
                    >
                        <ArrowLeftOnRectangleIcon className="h-4 w-4 flex-shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-hidden">
                <div className="h-full flex flex-col">
                    {/* Content Area with compact padding */}
                    <div className="flex-1 overflow-hidden pt-12 xl:pt-12">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
