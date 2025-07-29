
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
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Logo Section */}
                    <div className="text-center py-6 sm:py-8">
                        <div className="inline-block relative mb-2 sm:mb-4">

                        </div>
                        <Link to="/" className="block">
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-widest text-foreground hover:text-primary transition-colors">
                                behindyourbrain
                            </h1>
                            <p className="text-xs tracking-[0.2em] text-muted-foreground mt-1">
                                CREATIVE MAGAZINE
                            </p>
                        </Link>
                    </div>

                    {/* Navigation Section */}
                    <div className="flex justify-between items-center border-t border-b border-border py-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden w-8 h-8 flex items-center justify-center text-foreground hover:text-primary transition-colors"
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
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <ThemeToggle />
                            
                            <button className="hidden sm:flex w-6 h-6 border rounded-full border-border items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Search">
                                <SearchIcon className="w-3 h-3 text-foreground" />
                            </button>

                            <div className="hidden sm:flex items-center gap-2 text-sm">
                                <button className="w-6 h-6 border rounded-full border-border flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-colors" aria-label="Language">
                                    <GlobeAltIcon className="w-4 h-4 text-foreground" />
                                </button>
                                <span className="text-foreground text-xs">EN</span>
                            </div>
                            
                            <Link 
                                to="/login" 
                                className="px-3 sm:px-6 py-2 bg-primary dark:bg-primary-dark rounded-md text-white text-xs sm:text-sm font-medium hover:bg-primary-dark dark:hover:bg-primary transition-colors"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
                
                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-light dark:bg-dark border-b border-slate-200 dark:border-slate-700 shadow-lg z-50">
                        <nav className="max-w-screen-xl mx-auto px-4">
                            <ul className="py-4">
                                <NavItem to="/" mobile>Home</NavItem>
                                
                                {/* Mobile Categories */}
                                <li className="border-b border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                        className="flex items-center justify-between w-full py-2 px-4 text-sm font-medium text-dark-text dark:text-light-text hover:text-primary dark:hover:text-primary transition-colors"
                                    >
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full border border-primary dark:border-primary"></div>
                                            Categories
                                        </span>
                                        <svg className={`w-4 h-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                    
                                    {isCategoriesOpen && context && (
                                        <div className="pl-6 pb-2">
                                            {context.categories.map((category) => (
                                                <Link
                                                    key={category.id}
                                                    to={`/category/${category.slug}`}
                                                    onClick={() => {
                                                        setIsCategoriesOpen(false);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className="block py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </li>
                                
                                <NavItem to="/mobile-demo" mobile>Mobile Demo</NavItem>
                                <NavItem to="/admin" mobile>Contact</NavItem>
                            </ul>
                            <div className="py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-4">
                                <button className="w-6 h-6 border rounded-full border-slate-400 dark:border-slate-500 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-medium-dark transition-colors" aria-label="Search">
                                    <SearchIcon className="w-3 h-3 text-dark-text dark:text-light-text" />
                                </button>
                                <div className="flex items-center gap-2 text-sm">
                                    <button className="w-6 h-6 border rounded-full border-slate-400 dark:border-slate-500 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-medium-dark transition-colors" aria-label="Language">
                                        <GlobeAltIcon className="w-4 h-4 text-dark-text dark:text-light-text" />
                                    </button>
                                    <span className="text-dark-text dark:text-light-text text-xs">EN</span>
                                </div>
                            </div>
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
};

export default Header;
