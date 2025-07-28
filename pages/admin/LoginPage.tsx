
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';

const LoginPage: React.FC = () => {
    const context = useContext(BlogContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('adityapathak1501@gmail.com');
    const [password, setPassword] = useState('bipul281B#@#');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (context?.isAdmin) {
            navigate('/admin');
        }
    }, [context?.isAdmin, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!context) return;
        
        setIsLoading(true);
        try {
            await context.login(email, password);
            navigate('/admin');
        } catch (error) {
            console.error('Login failed:', error);
            // Error is already handled in the context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-light dark:bg-dark">
            <div className="w-full max-w-md p-8 space-y-8 bg-light dark:bg-dark rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">Admin Login</h1>
                <p className="text-center text-secondary dark:text-gray-400">Enter credentials to access the dashboard.</p>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="relative">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 text-dark-text bg-gray-200 dark:bg-medium-dark dark:text-light-text border border-gray-400 dark:border-light-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Email address"
                        />
                    </div>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 text-dark-text bg-gray-200 dark:bg-medium-dark dark:text-light-text border border-gray-400 dark:border-light-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Password"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-light-text bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                {context?.error && (
                    <div className="text-center text-sm text-red-500 dark:text-red-500">
                        {context.error}
                    </div>
                )}
                <p className="text-center text-xs text-secondary dark:text-gray-400">
                    Use your Supabase admin credentials to sign in.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
