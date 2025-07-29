import React, { useState, useEffect } from 'react';
import EnhancedRichTextEditor from '../components/EnhancedRichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PostEditorComparison: React.FC = () => {
  const [content1, setContent1] = useState('<p>Working diagnostic editor content...</p>');
  const [content2, setContent2] = useState('<p>PostEditorPage style editor content...</p>');
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  const addDiagnostic = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnostics(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[COMPARISON] ${message}`);
  };

  useEffect(() => {
    addDiagnostic('PostEditorComparison page loaded');
    
    // Monitor toolbar visibility
    const checkToolbars = () => {
      const toolbars = document.querySelectorAll('.tox-toolbar');
      addDiagnostic(`Found ${toolbars.length} toolbar(s) on page`);
      
      toolbars.forEach((toolbar, index) => {
        const element = toolbar as HTMLElement;
        const rect = element.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(element);
        
        addDiagnostic(`Toolbar ${index}: display=${computedStyle.display}, visibility=${computedStyle.visibility}, height=${rect.height}px`);
      });
    };

    const interval = setInterval(checkToolbars, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">PostEditorPage vs Diagnostic Comparison</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Working Diagnostic Style */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-600">✅ Working Diagnostic Style</h2>
            <div className="border border-gray-300 rounded-lg p-4">
              <EnhancedRichTextEditor
                value={content1}
                onChange={setContent1}
                placeholder="This should work properly..."
                height={400}
                enableAutoSave={false}
                showWordCount={true}
                enableKeyboardShortcuts={true}
                enableMediaUpload={false}
                enableLinking={true}
                enableTables={true}
                enableFullScreen={true}
                enableSourceCode={true}
                enableAdvancedFormatting={true}
                enableCustomStyles={true}
                enableEmbeds={false}
                enableAnchorLinks={true}
              />
            </div>
          </div>

          {/* PostEditorPage Style */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-600">❌ PostEditorPage Style (Fixed)</h2>
            
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="mt-4" style={{ minHeight: '500px' }}>
                <div className="h-full flex flex-col" style={{ minHeight: '500px' }}>
                  <div className="flex-1" style={{ minHeight: '500px' }}>
                    <div style={{ height: '500px', minHeight: '500px' }}>
                      <EnhancedRichTextEditor
                        value={content2}
                        onChange={setContent2}
                        placeholder="This should now work like PostEditorPage..."
                        height={500}
                        autoHeight={false}
                        className=""
                        enableAutoSave={false}
                        showWordCount={true}
                        enableKeyboardShortcuts={true}
                        enableMediaUpload={false}
                        enableLinking={true}
                        enableTables={true}
                        enableFullScreen={true}
                        enableSourceCode={true}
                        enableAdvancedFormatting={true}
                        enableCustomStyles={true}
                        enableEmbeds={false}
                        enableAnchorLinks={true}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="seo" className="mt-4">
                <div className="p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">SEO Tab</h3>
                  <p>Switch back to Content to test persistence.</p>
                  <p>Content length: {content2.length} characters</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Diagnostics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Diagnostics Log</h2>
          <div className="bg-gray-100 rounded p-3 h-64 overflow-y-auto">
            {diagnostics.length === 0 ? (
              <p className="text-gray-500">No diagnostics yet...</p>
            ) : (
              <div className="space-y-1">
                {diagnostics.map((diagnostic, index) => (
                  <div key={index} className="text-xs font-mono text-gray-700">
                    {diagnostic}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 space-x-2">
            <button
              onClick={() => {
                const toolbars = document.querySelectorAll('.tox-toolbar');
                addDiagnostic(`Manual check: Found ${toolbars.length} toolbar(s)`);
                toolbars.forEach((toolbar, index) => {
                  const element = toolbar as HTMLElement;
                  const rect = element.getBoundingClientRect();
                  addDiagnostic(`Toolbar ${index}: ${rect.width}x${rect.height} at (${rect.left}, ${rect.top})`);
                });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Check Toolbars
            </button>
            <button
              onClick={() => setDiagnostics([])}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostEditorComparison;
