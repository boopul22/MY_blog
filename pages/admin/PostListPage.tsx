
import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '../../components/icons';

const PostListPage: React.FC = () => {
    const context = useContext(BlogContext);
    const navigate = useNavigate();

    if (!context) return <div>Loading...</div>;

    const { posts, deletePost, categories } = context;

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Uncategorized';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Posts</h1>
                <button
                    onClick={() => navigate('/admin/posts/new')}
                    className="flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Post
                </button>
            </div>
            <div className="bg-white dark:bg-medium-dark shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-light-dark">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Category</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Date</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map(post => (
                            <tr key={post.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-light-dark/50">
                                <td className="px-5 py-4 text-sm">
                                    <p className="text-gray-900 dark:text-white whitespace-no-wrap font-medium">{post.title}</p>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400 whitespace-no-wrap">{getCategoryName(post.categoryId)}</p>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <span className={`relative inline-block px-3 py-1 font-semibold leading-tight ${post.status === 'published' ? 'text-green-900' : 'text-yellow-900'}`}>
                                        <span aria-hidden className={`absolute inset-0 ${post.status === 'published' ? 'bg-green-200' : 'bg-yellow-200'} opacity-50 rounded-full`}></span>
                                        <span className="relative">{post.status}</span>
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <p className="text-gray-600 dark:text-gray-400 whitespace-no-wrap">{new Date(post.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className="px-5 py-4 text-sm">
                                    <div className="flex items-center space-x-3">
                                        <Link to={`/post/${post.slug}`} target="_blank" className="text-gray-500 hover:text-blue-500" title="View Post">
                                            <EyeIcon className="w-5 h-5"/>
                                        </Link>
                                        <button onClick={() => navigate(`/admin/posts/edit/${post.id}`)} className="text-gray-500 hover:text-primary" title="Edit Post">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => window.confirm('Are you sure?') && deletePost(post.id)} className="text-gray-500 hover:text-red-500" title="Delete Post">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PostListPage;
