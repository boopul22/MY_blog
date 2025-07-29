import React, { useState } from 'react';
import LazyEnhancedRichTextEditor from '../../components/LazyEnhancedRichTextEditor';
import FormField from '../../components/FormField';

const EditorTestPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('<p>This is a test content for the TinyMCE editor.</p>');
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  console.log('EditorTestPage render:', { title, excerpt, content: content.substring(0, 50) + '...' });

  // Track content changes for debugging
  const handleContentChange = (newContent: string) => {
    console.log('Content changing from:', content.length, 'to:', newContent.length, 'characters');
    setContent(newContent);
    setLastUpdate(Date.now());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Editor Test Page
        </h1>
        
        <div className="space-y-6">
          {/* Title Input Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Title Input Test
            </h2>
            <FormField
              label="Title"
              required
              hint="Test the basic title input field"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a test title..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </FormField>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Current value: "{title}"
            </p>
          </div>

          {/* Excerpt Textarea Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Excerpt Textarea Test
            </h2>
            <FormField
              label="Excerpt"
              hint="Test the basic textarea field"
            >
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Enter a test excerpt..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </FormField>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Current value: "{excerpt}"
            </p>
          </div>

          {/* TinyMCE Editor Test */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              TinyMCE Rich Text Editor Test
            </h2>
            <FormField
              label="Content"
              required
              hint="Test the TinyMCE rich text editor"
            >
              <LazyEnhancedRichTextEditor
                value={content}
                onChange={handleContentChange}
                placeholder="Start typing in the rich text editor..."
                height={400}
                enableAutoSave={false}
                showWordCount={true}
                showDetailedStats={true}
                enableKeyboardShortcuts={true}
                enableMediaUpload={true}
                enableLinking={true}
                enableTables={true}
                enableFullScreen={true}
                enableSourceCode={true}
                enableAdvancedFormatting={true}
                enableCustomStyles={true}
                enableEmbeds={true}
                enableAnchorLinks={true}
              />
            </FormField>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Current HTML Content:
              </h3>
              <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-all">
                {content}
              </pre>
            </div>
          </div>

          {/* Debug Information */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-4">
              Debug Information
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>TinyMCE API Key:</strong> {import.meta.env.VITE_TINYMCE_API_KEY ? 'Present' : 'Missing'}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Environment:</strong> {import.meta.env.MODE}
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Title Length:</strong> {title.length} characters
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Excerpt Length:</strong> {excerpt.length} characters
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Content Length:</strong> {content.length} characters
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                <strong>Last Update:</strong> {new Date(lastUpdate).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Real-time Content Monitor */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
              Real-time Content Monitor
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-blue-700 dark:text-blue-300">
                <strong>Content Preview (first 100 chars):</strong>
              </p>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border font-mono text-xs">
                {content.substring(0, 100)}...
              </div>
              <p className="text-blue-700 dark:text-blue-300">
                <strong>Character Count:</strong> {content.length}
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                <strong>Word Count:</strong> {content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(w => w.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorTestPage;
