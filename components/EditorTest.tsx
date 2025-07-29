import React, { useState } from 'react';
import LazyEnhancedRichTextEditor from './LazyEnhancedRichTextEditor';

const EditorTest: React.FC = () => {
  const [content, setContent] = useState('<p>Test the optimized TinyMCE editor configuration...</p>');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Optimized TinyMCE Editor Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Foundation Optimization Test</h2>
        <p className="text-gray-600 mb-4">
          Testing the optimized TinyMCE configuration with improved performance, 
          better toolbar organization, and enhanced content styling.
        </p>
        
        <LazyEnhancedRichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Start typing to test the optimized editor..."
          height={400}
          enableAutoSave={false}
          showWordCount={true}
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
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Content Preview:</h3>
          <div className="text-sm text-gray-600 max-h-32 overflow-y-auto">
            {content.substring(0, 200)}...
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorTest;
