
import React, { useState, useContext } from 'react';
import { BlogContext } from '../../context/SupabaseBlogContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrashIcon } from '../../components/icons';

const CategoryManagerPage: React.FC = () => {
    const [newCategory, setNewCategory] = useState('');
    const [newTag, setNewTag] = useState('');
    const context = useContext(BlogContext);

    if (!context) return <div className="p-4">Loading...</div>;

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

    const handleDeleteCategory = (categoryId: string, categoryName: string) => {
        if (window.confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            deleteCategory(categoryId).catch(console.error);
        }
    };

    const handleDeleteTag = (tagId: string, tagName: string) => {
        if (window.confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
            deleteTag(tagId).catch(console.error);
        }
    };

    return (
        <div className="p-4 space-y-4 h-full overflow-auto">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Manage Categories & Tags</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Categories Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Categories ({categories.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleAddCategory} className="flex gap-2">
                            <Input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="New category name"
                                className="flex-1"
                            />
                            <Button type="submit" size="sm">Add</Button>
                        </form>

                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {categories.map(category => (
                                <div key={category.id} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                                    <span className="font-medium">{category.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteCategory(category.id, category.name)}
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No categories yet. Add one above.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tags Section */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Tags ({tags.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleAddTag} className="flex gap-2">
                            <Input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                placeholder="New tag name"
                                className="flex-1"
                            />
                            <Button type="submit" size="sm">Add</Button>
                        </form>

                        <div className="max-h-[400px] overflow-y-auto">
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <Badge key={tag.id} variant="secondary" className="gap-1 pr-1">
                                        <span>{tag.name}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                        >
                                            <span className="text-xs">×</span>
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                            {tags.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No tags yet. Add one above.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default CategoryManagerPage;
