
import React, { useState, useContext } from 'react';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { TrashIcon } from '../../components/icons';

const CategoryManagerPage: React.FC = () => {
    const [newCategory, setNewCategory] = useState('');
    const [newTag, setNewTag] = useState('');
    const context = useContext(BlogContext);

    if (!context) return <div>Loading...</div>;

    const { categories, tags, addCategory, deleteCategory, addTag, deleteTag } = context;

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            try {
                await addCategory(newCategory.trim());
                setNewCategory('');
            } catch (error) {
                console.error('Failed to add category:', error);
            }
        }
    };
    
    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newTag.trim()) {
            try {
                await addTag(newTag.trim());
                setNewTag('');
            } catch (error) {
                console.error('Failed to add tag:', error);
            }
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Manage Categories & Tags</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categories Section */}
                <div className="bg-white dark:bg-medium-dark p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Categories</h2>
                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name"
                            className="flex-grow bg-gray-100 dark:bg-light-dark border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">Add</button>
                    </form>
                    <ul className="space-y-2">
                        {categories.map(category => (
                            <li key={category.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-light-dark rounded-md">
                                <span className="text-gray-800 dark:text-gray-200">{category.name}</span>
                                <button onClick={() => deleteCategory(category.id).catch(console.error)} className="text-gray-500 hover:text-red-500">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Tags Section */}
                <div className="bg-white dark:bg-medium-dark p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Tags</h2>
                     <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="New tag name"
                            className="flex-grow bg-gray-100 dark:bg-light-dark border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">Add</button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                         {tags.map(tag => (
                            <div key={tag.id} className="flex items-center bg-gray-200 dark:bg-light-dark text-gray-800 dark:text-gray-200 text-sm font-medium px-3 py-1 rounded-full">
                                <span>{tag.name}</span>
                                <button onClick={() => deleteTag(tag.id).catch(console.error)} className="ml-2 text-gray-500 hover:text-red-500">
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagerPage;
