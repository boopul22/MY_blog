
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
            <h1 className="text-3xl font-bold text-dark-text dark:text-light-text mb-6">Manage Categories & Tags</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categories Section */}
                <div className="bg-light dark:bg-dark p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-dark-text dark:text-light-text mb-4">Categories</h2>
                    <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name"
                            className="flex-grow bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        <button type="submit" className="bg-primary hover:bg-primary-dark text-light-text font-bold py-2 px-4 rounded-lg transition-colors">Add</button>
                    </form>
                    <ul className="space-y-2">
                        {categories.map(category => (
                            <li key={category.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-medium-dark rounded-md">
                                <span className="text-dark-text dark:text-light-text">{category.name}</span>
                                <button onClick={() => deleteCategory(category.id).catch(console.error)} className="text-secondary hover:text-red-600">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* Tags Section */}
                <div className="bg-light dark:bg-dark p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-dark-text dark:text-light-text mb-4">Tags</h2>
                     <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="New tag name"
                            className="flex-grow bg-gray-200 dark:bg-medium-dark border-gray-400 dark:border-light-dark rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                        <button type="submit" className="bg-primary hover:bg-primary-dark text-light-text font-bold py-2 px-4 rounded-lg transition-colors">Add</button>
                    </form>
                    <div className="flex flex-wrap gap-2">
                         {tags.map(tag => (
                            <div key={tag.id} className="flex items-center bg-gray-300 dark:bg-medium-dark text-dark-text dark:text-light-text text-sm font-medium px-3 py-1 rounded-full">
                                <span>{tag.name}</span>
                                <button onClick={() => deleteTag(tag.id).catch(console.error)} className="ml-2 text-secondary hover:text-red-600">
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
