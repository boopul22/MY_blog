
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';

const LoginPage: React.FC = () => {
    const context = useContext(BlogContext);
    const navigate = useNavigate();
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
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
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-medium-dark rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-primary">Admin Login</h1>
                <p className="text-center text-gray-600 dark:text-gray-300">Enter credentials to access the dashboard.</p>
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
                            className="w-full px-4 py-3 text-gray-900 bg-gray-100 dark:bg-light-dark dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                            className="w-full px-4 py-3 text-gray-900 bg-gray-100 dark:bg-light-dark dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Password"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                {context?.error && (
                    <div className="text-center text-sm text-red-600 dark:text-red-400">
                        {context.error}
                    </div>
                )}
                <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                    Use your Supabase admin credentials to sign in.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
