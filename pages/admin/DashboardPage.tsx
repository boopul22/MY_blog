
import React, { useContext } from 'react';
import { BlogContext } from '../../context/SupabaseBlogContext';
import AnalyticsChart from '../../components/AnalyticsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        <Card className="p-4">
            <CardContent className="flex items-center p-0">
                <div className="p-2 bg-primary/10 rounded-md mr-3 text-primary">
                    {icon}
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="text-xl font-bold">{value}</p>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="p-4 space-y-4 h-full overflow-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>

            {/* Stats Grid - Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard title="Total Posts" value={posts.length} icon={<DocumentTextIcon className="h-4 w-4" />} />
                <StatCard title="Published" value={publishedCount} icon={<DocumentTextIcon className="h-4 w-4" />} />
                <StatCard title="Drafts" value={draftCount} icon={<DocumentTextIcon className="h-4 w-4" />} />
                <StatCard title="Categories" value={categories.length} icon={<TagIcon className="h-4 w-4" />} />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                <div className="lg:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0">
                            <AnalyticsChart />
                        </CardContent>
                    </Card>
                </div>

                <Card className="h-fit">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Recent Posts</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                        <div className="space-y-3">
                            {posts.slice(0, 5).map(post => (
                                <div key={post.id} className="flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{post.title}</p>
                                        <Badge
                                            variant={post.status === 'published' ? 'default' : 'secondary'}
                                            className="text-xs mt-1"
                                        >
                                            {post.status}
                                        </Badge>
                                    </div>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;
