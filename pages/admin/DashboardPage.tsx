
import React, { useContext } from 'react';
import { BlogContext } from '../../context/SupabaseBlogContext';
import AnalyticsChart from '../../components/AnalyticsChart';
import { DocumentTextIcon, TagIcon } from '../../components/icons';

const DashboardPage: React.FC = () => {
    const context = useContext(BlogContext);

    if (!context) {
        return <div>Loading...</div>;
    }

    const { posts, categories, tags } = context;
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;

    const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
        <div className="bg-light dark:bg-dark p-6 rounded-lg shadow-md flex items-center">
            <div className="p-3 bg-primary/10 rounded-full mr-4 text-primary">
                {icon}
            </div>
            <div>
                <p className="text-sm text-secondary dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-dark-text dark:text-light-text">{value}</p>
            </div>
        </div>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-dark-text dark:text-light-text mb-6">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total Posts" value={posts.length} icon={<DocumentTextIcon className="w-6 h-6" />} />
                <StatCard title="Published" value={publishedCount} icon={<DocumentTextIcon className="w-6 h-6" />} />
                <StatCard title="Drafts" value={draftCount} icon={<DocumentTextIcon className="w-6 h-6" />} />
                <StatCard title="Categories" value={categories.length} icon={<TagIcon className="w-6 h-6" />} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AnalyticsChart />
                </div>
                <div className="bg-light dark:bg-dark p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4 text-dark-text dark:text-light-text">Recent Posts</h3>
                    <ul className="space-y-4">
                        {posts.slice(0, 5).map(post => (
                            <li key={post.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium text-dark-text dark:text-light-text">{post.title}</p>
                                    <p className={`text-xs font-semibold ${post.status === 'published' ? 'text-green-600' : 'text-yellow-600'}`}>{post.status}</p>
                                </div>
                                <span className="text-sm text-secondary dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
