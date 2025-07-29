
import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '../../components/icons';

const PostListPage: React.FC = () => {
    const context = useContext(BlogContext);
    const navigate = useNavigate();

    if (!context) return <div className="p-4">Loading...</div>;

    const { posts, deletePost, categories } = context;

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
    };

    const handleDeletePost = (postId: string, postTitle: string) => {
        if (window.confirm(`Are you sure you want to delete "${postTitle}"?`)) {
            deletePost(postId);
        }
    };

    return (
        <div className="p-4 space-y-4 h-full overflow-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Manage Posts</h1>
                <Button onClick={() => navigate('/admin/posts/new')} className="gap-2">
                    <PlusIcon className="h-4 w-4" />
                    New Post
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Posts ({posts.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="w-[120px]">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.map(post => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">
                                        <div className="max-w-[300px] truncate">
                                            {post.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs">
                                            {getCategoryName(post.categoryId)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={post.status === 'published' ? 'default' : 'secondary'}
                                            className="text-xs"
                                        >
                                            {post.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                className="h-8 w-8"
                                            >
                                                <Link to={`/post/${post.slug}`} target="_blank" title="View Post">
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                                                className="h-8 w-8"
                                                title="Edit Post"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeletePost(post.id, post.title)}
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                title="Delete Post"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default PostListPage;
