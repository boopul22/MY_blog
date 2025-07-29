
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FacebookIcon, TwitterIcon, PinterestIcon, LinkedInIcon } from './icons';

const Footer: React.FC = () => {
    const { isDarkMode } = useTheme();

    return (
        <footer className={`bg-light dark:bg-dark text-dark-text dark:text-light-text transition-colors`}>
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and About Section */}
                    <div className="md:col-span-1">
                        <Link to="/" className="block mb-4">
                            <h2 className="text-2xl font-serif tracking-widest text-dark-text dark:text-light-text hover:text-primary dark:hover:text-primary transition-colors">
                                behindyourbrain
                            </h2>
                            <p className="text-xs tracking-[0.2em] text-secondary dark:text-slate-400 mt-1">
                                CREATIVE MAGAZINE
                            </p>
                        </Link>
                        <p className="text-sm text-secondary dark:text-slate-400">
                            behindyourbrain is a creative magazine dedicated to sharing inspiring stories, beautiful photography, and thought-provoking articles from around the world.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-dark-text dark:text-light-text mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-sm text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Home</Link></li>
                            <li><Link to="/posts" className="text-sm text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">All Posts</Link></li>
                            <li><Link to="/admin" className="text-sm text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Categories (Dummy) */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-dark-text dark:text-light-text mb-4">Categories</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Lifestyle</a></li>
                            <li><a href="#" className="text-sm text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Travel</a></li>
                            <li><a href="#" className="text-sm text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Technology</a></li>
                            <li><a href="#" className="text-sm text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Design</a></li>
                        </ul>
                    </div>

                    {/* Follow Us */}
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-dark-text dark:text-light-text mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"><FacebookIcon className="w-5 h-5" /></a>
                            <a href="#" className="text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"><TwitterIcon className="w-5 h-5" /></a>
                            <a href="#" className="text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"><LinkedInIcon className="w-5 h-5" /></a>
                            <a href="#" className="text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"><PinterestIcon className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-light-dark flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-secondary dark:text-slate-400 text-center sm:text-left">
                        &copy; {new Date().getFullYear()} behindyourbrain Creative Magazine. All Rights Reserved.
                    </p>
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        <a href="#" className="text-xs text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Terms of Use</a>
                        <a href="#" className="text-xs text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
