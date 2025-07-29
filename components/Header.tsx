
import React, { useState, useContext, useEffect, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { BlogContext } from '../context/SupabaseBlogContext';
import { MenuIcon, SearchIcon, GlobeAltIcon } from './icons';
import { ThemeToggle } from '../src/components/ThemeSelector';

const Header: React.FC = () => {
    const { isDarkMode } = useTheme();
    const context = useContext(BlogContext);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    // Close dropdown when clicking outside - optimized with passive listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCategoriesOpen(false);
            }
        };

        // Use passive listener for better performance
        document.addEventListener('mousedown', handleClickOutside, { passive: true });
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const NavItem: React.FC<{ to: string; children: React.ReactNode; mobile?: boolean }> = ({ to, children, mobile = false }) => (
        <li>
            <NavLink
                to={to}
                onClick={() => mobile && setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                    `flex items-center gap-2 text-sm font-medium text-dark-text dark:text-light-text hover:text-primary dark:hover:text-primary transition-colors ${
                        isActive ? 'text-primary dark:text-primary' : ''
                    } ${mobile ? 'py-2 px-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0' : ''}`
                }
            >
                <div className="w-2 h-2 rounded-full border border-primary dark:border-primary"></div>
                {children}
            </NavLink>
        </li>
    );

    return (
        <>
            <header className="bg-background transition-colors relative">
                {/* Header Content Section */}
                <div className="content-header">
                    <div className="main-container">
                        {/* Mobile-First Logo Section */}
                        <div className="text-center py-fluid-md">
                            <Link to="/" className="block">
                                <h1 className="text-fluid-2xl md:text-fluid-3xl lg:text-fluid-4xl font-serif tracking-widest text-foreground hover:text-primary transition-colors">
                                    behindyourbrain
                                </h1>
                                <p className="text-fluid-xs tracking-[0.2em] text-muted-foreground mt-1">
                                    CREATIVE MAGAZINE
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <div className="section-divider-subtle"></div>
                <div className="main-container">
                    <div className="flex justify-between items-center py-fluid-sm">
                        {/* Mobile Menu Button - Enhanced Touch Target */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden touch-target text-foreground hover:text-primary transition-colors rounded-lg hover:bg-muted/50"
                            aria-label="Toggle mobile menu"
                        >
                            <MenuIcon className="w-6 h-6" />
                        </button>
                        
                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex flex-1 justify-center">
                            <ul className="flex items-center space-x-6 lg:space-x-8">
                                <NavItem to="/">Home</NavItem>
                                
                                {/* Categories Dropdown */}
                                <li className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                        className="flex items-center gap-2 text-sm font-medium text-dark-text dark:text-light-text hover:text-primary dark:hover:text-primary transition-colors"
                                    >
                                        <div className="w-2 h-2 rounded-full border border-primary dark:border-primary"></div>
                                        Categories
                                        <svg className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isCategoriesOpen && context && (
                                        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                                            <div className="py-2">
                                                {context.categories.map((category) => (
                                                    <Link
                                                        key={category.id}
                                                        to={`/category/${category.slug}`}
                                                        onClick={() => setIsCategoriesOpen(false)}
                                                        className="block px-4 py-2 text-sm text-dark-text dark:text-light-text hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary transition-colors"
                                                    >
                                                        {category.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </li>
                                
                                <NavItem to="/mobile-demo">Mobile Demo</NavItem>
                                <NavItem to="/admin">Contact</NavItem>
                            </ul>
                        </nav>
                        
                        {/* Mobile-Optimized Action Buttons */}
                        <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4">
                            <ThemeToggle />

                            {/* Mobile: Show search button, hide on xs screens */}
                            <button className="hidden xs:flex touch-target border rounded-full border-border hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Search">
                                <SearchIcon className="w-4 h-4 text-foreground" />
                            </button>

                            {/* Language selector - hidden on mobile, shown on tablet+ */}
                            <div className="hidden md:flex items-center gap-2 text-sm">
                                <button className="touch-target border rounded-full border-border hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Language">
                                    <GlobeAltIcon className="w-4 h-4 text-foreground" />
                                </button>
                                <span className="text-foreground text-xs">EN</span>
                            </div>

                            {/* Mobile-optimized login button */}
                            <Link
                                to="/login"
                                className="touch-target px-3 xs:px-4 sm:px-6 bg-primary rounded-lg text-white text-fluid-xs font-medium hover:bg-primary/90 transition-colors"
                            >
                                <span className="xs:hidden">•••</span>
                                <span className="hidden xs:inline">Login</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* App-Like Mobile Navigation Menu */}
            {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />

                        {/* Slide-out Menu */}
                        <div className="md:hidden fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-background border-r border-border shadow-2xl z-50 transform transition-transform duration-300 ease-out">
                            <div className="flex flex-col h-full">
                                {/* Menu Header */}
                                <div className="flex items-center justify-between p-4 border-b border-border">
                                    <h2 className="text-lg font-semibold text-foreground">Menu</h2>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="touch-target text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                                        aria-label="Close menu"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Navigation Items */}
                                <nav className="flex-1 overflow-y-auto">
                                    <ul className="p-4 space-y-2">
                                        <li>
                                            <NavLink
                                                to="/"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors touch-target ${
                                                        isActive ? 'bg-muted text-primary' : ''
                                                    }`
                                                }
                                            >
                                                <div className="w-2 h-2 rounded-full border border-primary"></div>
                                                Home
                                            </NavLink>
                                        </li>

                                        {/* Mobile Categories */}
                                        <li>
                                            <button
                                                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                                className="flex items-center justify-between w-full p-3 rounded-lg text-foreground hover:bg-muted transition-colors touch-target"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full border border-primary"></div>
                                                    Categories
                                                </span>
                                                <svg className={`w-5 h-5 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {isCategoriesOpen && context && (
                                                <div className="ml-5 mt-2 space-y-1">
                                                    {context.categories.map((category) => (
                                                        <Link
                                                            key={category.id}
                                                            to={`/category/${category.slug}`}
                                                            onClick={() => {
                                                                setIsCategoriesOpen(false);
                                                                setIsMobileMenuOpen(false);
                                                            }}
                                                            className="block p-2 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors touch-target"
                                                        >
                                                            {category.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </li>

                                        <li>
                                            <NavLink
                                                to="/mobile-demo"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors touch-target ${
                                                        isActive ? 'bg-muted text-primary' : ''
                                                    }`
                                                }
                                            >
                                                <div className="w-2 h-2 rounded-full border border-primary"></div>
                                                Mobile Demo
                                            </NavLink>
                                        </li>

                                        <li>
                                            <NavLink
                                                to="/admin"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={({ isActive }) =>
                                                    `flex items-center gap-3 p-3 rounded-lg text-foreground hover:bg-muted transition-colors touch-target ${
                                                        isActive ? 'bg-muted text-primary' : ''
                                                    }`
                                                }
                                            >
                                                <div className="w-2 h-2 rounded-full border border-primary"></div>
                                                Contact
                                            </NavLink>
                                        </li>
                                    </ul>
                                </nav>

                                {/* Menu Footer */}
                                <div className="p-4 border-t border-border">
                                    <div className="flex items-center justify-center space-x-4">
                                        <button className="touch-target border rounded-full border-border hover:bg-muted transition-colors" aria-label="Search">
                                            <SearchIcon className="w-4 h-4 text-foreground" />
                                        </button>
                                        <div className="flex items-center gap-2">
                                            <button className="touch-target border rounded-full border-border hover:bg-muted transition-colors" aria-label="Language">
                                                <GlobeAltIcon className="w-4 h-4 text-foreground" />
                                            </button>
                                            <span className="text-foreground text-xs">EN</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
        </>
    );
};

export default Header;
