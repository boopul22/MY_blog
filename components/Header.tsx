
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
                    `flex items-center gap-2 text-sm font-medium text-dark-text dark:text-light-text hover:text-primary dark:hover:text-primary transition-colors ${
                        isActive ? 'text-primary dark:text-primary' : ''
                    }`
                }
            >
                <div className="w-2 h-2 rounded-full border border-primary dark:border-primary"></div>
                {children}
            </NavLink>
        </li>
    );

    return (
        <>

            <header className="bg-light dark:bg-dark transition-colors">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Logo Section */}
                    <div className="text-center py-8">
                        <div className="inline-block relative mb-4">
                            <div className="w-16 h-1 bg-slate-300 dark:bg-light-dark mx-auto"></div>
                        </div>
                        <Link to="/" className="block">
                            <h1 className="text-5xl font-serif tracking-widest text-dark-text dark:text-light-text hover:text-primary dark:hover:text-primary transition-colors">
                                Athena
                            </h1>
                            <p className="text-xs tracking-[0.2em] text-secondary dark:text-slate-400 mt-1">
                                CREATIVE MAGAZINE
                            </p>
                        </Link>
                    </div>
                    
                    {/* Navigation Section */}
                    <div className="flex justify-between items-center border-t border-b border-slate-200 dark:border-light-dark py-4">
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
                                className="w-6 h-6 border rounded-full border-slate-400 dark:border-slate-500 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-medium-dark transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? 
                                    <SunIcon className="w-4 h-4 text-dark-text dark:text-light-text" /> : 
                                    <MoonIcon className="w-4 h-4 text-dark-text dark:text-light-text" />
                                }
                            </button>
                            
                            <button className="w-6 h-6 border rounded-full border-slate-400 dark:border-slate-500 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-medium-dark transition-colors" aria-label="Search">
                                <SearchIcon className="w-3 h-3 text-dark-text dark:text-light-text" />
                            </button>
                            
                            <div className="flex items-center gap-2 text-sm">
                                <button className="w-6 h-6 border rounded-full border-slate-400 dark:border-slate-500 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-medium-dark transition-colors" aria-label="Language">
                                    <GlobeAltIcon className="w-4 h-4 text-dark-text dark:text-light-text" />
                                </button>
                                <span className="text-dark-text dark:text-light-text text-xs">EN</span>
                            </div>
                            
                            <Link 
                                to="/login" 
                                className="px-6 py-2 bg-primary dark:bg-primary-dark rounded-md text-white text-sm font-medium hover:bg-primary-dark dark:hover:bg-primary transition-colors"
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
