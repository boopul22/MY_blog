import React, { useState } from 'react';
import EnhancedRichTextEditor from '../components/EnhancedRichTextEditor';

const EditorDebugPage: React.FC = () => {
  const [content, setContent] = useState('<p>Testing toolbar visibility...</p>');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">TinyMCE Toolbar Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Editor Test</h2>
          <p className="text-gray-600 mb-4">
            This page is for debugging the TinyMCE toolbar visibility issue.
          </p>
          
          <div className="border border-gray-300 rounded-lg p-4">
            <EnhancedRichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Type here to test the editor..."
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
          </div>
          
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p className="text-sm">Content length: {content.length}</p>
            <p className="text-sm">TinyMCE Version: 7.9.1</p>
            <p className="text-sm">React Integration: @tinymce/tinymce-react 6.2.1</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorDebugPage;
