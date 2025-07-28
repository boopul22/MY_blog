import React, { useState, useContext, useEffect } from 'react';
import { BlogContext } from '../context/SupabaseBlogContext';
import { sitemapService } from '../services/sitemapService';

const SitemapGenerator: React.FC = () => {
    const context = useContext(BlogContext);
    const [sitemapXml, setSitemapXml] = useState<string>('');
    const [robotsTxt, setRobotsTxt] = useState<string>('');
    const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResults, setSubmissionResults] = useState<any>(null);
    const [validation, setValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
    const [activeTab, setActiveTab] = useState<'sitemap' | 'robots' | 'submission'>('sitemap');

    useEffect(() => {
        if (context) {
            generateSitemap();
        }
    }, [context]);

    const generateSitemap = async () => {
        if (!context) return;

        setIsGenerating(true);
        try {
            const { posts, categories } = context;
            const sitemap = sitemapService.generateSitemap(posts, categories);
            const robots = sitemapService.generateRobotsTxt('https://myawesomeblog.com/sitemap.xml');
            
            setSitemapXml(sitemap);
            setRobotsTxt(robots);
            setLastGenerated(new Date());
            
            // Validate the generated sitemap
            const validationResult = sitemapService.validateSitemap(sitemap);
            setValidation(validationResult);
        } catch (error) {
            console.error('Error generating sitemap:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const downloadSitemap = () => {
        const blob = new Blob([sitemapXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sitemap.xml';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadRobots = () => {
        const blob = new Blob([robotsTxt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'robots.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const submitToSearchEngines = async () => {
        setIsSubmitting(true);
        try {
            const results = await sitemapService.submitToSearchEngines('https://myawesomeblog.com/sitemap.xml');
            setSubmissionResults(results);
        } catch (error) {
            console.error('Error submitting sitemap:', error);
            setSubmissionResults({
                success: false,
                results: [{ engine: 'Error', success: false, error: 'Failed to submit sitemap' }]
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            // You could add a toast notification here
            console.log('Copied to clipboard');
        });
    };

    if (!context) {
        return <div className="p-6">Loading...</div>;
    }

    const { posts, categories } = context;
    const publishedPosts = posts.filter(p => p.status === 'published');

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Sitemap Generator
                </h2>
                <div className="flex space-x-3">
                    <button
                        onClick={generateSitemap}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        {isGenerating ? 'Generating...' : 'Regenerate'}
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Total URLs</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {publishedPosts.length + categories.length + 5}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Published Posts</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {publishedPosts.length}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Categories</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {categories.length}
                    </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Last Generated</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {lastGenerated ? lastGenerated.toLocaleString() : 'Never'}
                    </div>
                </div>
            </div>

            {/* Validation Status */}
            {validation && (
                <div className={`mb-6 p-4 rounded-lg ${validation.valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                    <div className={`font-medium ${validation.valid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        {validation.valid ? '✓ Sitemap is valid' : '✗ Sitemap has errors'}
                    </div>
                    {validation.errors.length > 0 && (
                        <ul className="mt-2 text-sm text-red-700 dark:text-red-300">
                            {validation.errors.map((error, index) => (
                                <li key={index}>• {error}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setActiveTab('sitemap')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'sitemap'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    Sitemap.xml
                </button>
                <button
                    onClick={() => setActiveTab('robots')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'robots'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    Robots.txt
                </button>
                <button
                    onClick={() => setActiveTab('submission')}
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'submission'
                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                    Search Engine Submission
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'sitemap' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Sitemap XML
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => copyToClipboard(sitemapXml)}
                                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                Copy
                            </button>
                            <button
                                onClick={downloadSitemap}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{sitemapXml}</code>
                    </pre>
                </div>
            )}

            {activeTab === 'robots' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Robots.txt
                        </h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => copyToClipboard(robotsTxt)}
                                className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                            >
                                Copy
                            </button>
                            <button
                                onClick={downloadRobots}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                                Download
                            </button>
                        </div>
                    </div>
                    <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{robotsTxt}</code>
                    </pre>
                </div>
            )}

            {activeTab === 'submission' && (
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                        Search Engine Submission
                    </h3>
                    <div className="space-y-4">
                        <p className="text-gray-600 dark:text-gray-400">
                            Submit your sitemap to search engines to help them discover and index your content.
                        </p>
                        
                        <button
                            onClick={submitToSearchEngines}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit to Search Engines'}
                        </button>

                        {submissionResults && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                    Submission Results
                                </h4>
                                <div className="space-y-2">
                                    {submissionResults.results.map((result: any, index: number) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <span className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {result.engine}: {result.success ? 'Success' : result.error}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SitemapGenerator;
