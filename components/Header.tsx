
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { MenuIcon, SearchIcon, MoonIcon, SunIcon, GlobeAltIcon } from './icons';



const Header: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();

    const NavItem: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
        <li>
            <NavLink
                to={to}
                className={({ isActive }) =>
                    `flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors ${
                        isActive ? 'text-black dark:text-white' : ''
                    }`
                }
            >
                <div className="w-2 h-2 rounded-full border border-pink-400 dark:border-pink-300"></div>
                {children}
            </NavLink>
        </li>
    );

    return (
        <>

            <header className="bg-white dark:bg-dark-text transition-colors">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Logo Section */}
                    <div className="text-center py-8">
                        <div className="inline-block relative mb-4">
                            <div className="w-16 h-1 bg-gray-300 dark:bg-light-dark mx-auto"></div>
                        </div>
                        <Link to="/" className="block">
                            <h1 className="text-5xl font-serif tracking-widest text-dark-text dark:text-light hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                Athena
                            </h1>
                            <p className="text-xs tracking-[0.2em] text-gray-500 dark:text-gray-400 mt-1">
                                CREATIVE MAGAZINE
                            </p>
                        </Link>
                    </div>
                    
                    {/* Navigation Section */}
                    <div className="flex justify-between items-center border-t border-b border-gray-200 dark:border-light-dark py-4">
                        <div className="flex-1"></div>
                        
                        <nav className="flex-1 flex justify-center">
                            <ul className="flex items-center space-x-8">
                                <NavItem to="/">Home</NavItem>
                                <NavItem to="/category/lifestyle">Pages</NavItem>
                                <NavItem to="/category/technology">Blog</NavItem>
                                <NavItem to="/admin">Contact</NavItem>
                            </ul>
                        </nav>
                        
                        <div className="flex-1 flex justify-end items-center space-x-4">
                            <button 
                                onClick={toggleDarkMode}
                                className="w-6 h-6 border rounded-full border-gray-400 dark:border-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-medium-dark transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? 
                                    <SunIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : 
                                    <MoonIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                }
                            </button>
                            
                            <button className="w-6 h-6 border rounded-full border-gray-400 dark:border-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-medium-dark transition-colors" aria-label="Search">
                                <SearchIcon className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                            </button>
                            
                            <div className="flex items-center gap-2 text-sm">
                                <button className="w-6 h-6 border rounded-full border-gray-400 dark:border-gray-500 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-medium-dark transition-colors" aria-label="Language">
                                    <GlobeAltIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                </button>
                                <span className="text-gray-600 dark:text-gray-300 text-xs">EN</span>
                            </div>
                            
                            <Link 
                                to="/login" 
                                className="px-6 py-2 bg-dark-text dark:bg-medium-dark rounded-md text-white text-sm font-medium hover:bg-gray-700 dark:hover:bg-light-dark transition-colors"
                            >
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
};

export default Header;
