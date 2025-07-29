import React, { useState, useEffect, useRef } from 'react';
import EnhancedRichTextEditor from '../components/EnhancedRichTextEditor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EditorDiagnosticPage: React.FC = () => {
  const [content, setContent] = useState('<p>Initial test content for toolbar visibility...</p>');
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('content');
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const addDiagnostic = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDiagnostics(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[DIAGNOSTIC] ${message}`);
  };

  useEffect(() => {
    addDiagnostic('EditorDiagnosticPage mounted');
    
    // Check for TinyMCE availability
    if (typeof window !== 'undefined' && (window as any).tinymce) {
      addDiagnostic('TinyMCE is available globally');
    } else {
      addDiagnostic('TinyMCE is NOT available globally');
    }

    // Monitor DOM changes for toolbar visibility
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          const toolbars = document.querySelectorAll('.tox-toolbar');
          if (toolbars.length > 0) {
            toolbars.forEach((toolbar, index) => {
              const isVisible = toolbar.checkVisibility ? toolbar.checkVisibility() : 
                               (toolbar as HTMLElement).offsetParent !== null;
              const computedStyle = window.getComputedStyle(toolbar as Element);
              addDiagnostic(`Toolbar ${index}: visible=${isVisible}, display=${computedStyle.display}, visibility=${computedStyle.visibility}`);
            });
          }
        }
      });
    });

    if (editorContainerRef.current) {
      observer.observe(editorContainerRef.current, { 
        childList: true, 
        subtree: true 
      });
    }

    return () => observer.disconnect();
  }, []);

  const handleTabChange = (value: string) => {
    addDiagnostic(`Tab changed from ${currentTab} to ${value}`);
    addDiagnostic(`Content length before tab change: ${content.length}`);
    setCurrentTab(value);
    
    // Check content after tab change
    setTimeout(() => {
      addDiagnostic(`Content length after tab change: ${content.length}`);
    }, 100);
  };

  const handleContentChange = (newContent: string) => {
    addDiagnostic(`Content changed: ${newContent.length} characters`);
    setContent(newContent);
  };

  const checkToolbarVisibility = () => {
    const toolbars = document.querySelectorAll('.tox-toolbar');
    addDiagnostic(`Found ${toolbars.length} toolbar(s)`);
    
    toolbars.forEach((toolbar, index) => {
      const element = toolbar as HTMLElement;
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
      
      addDiagnostic(`Toolbar ${index}:`);
      addDiagnostic(`  - Display: ${computedStyle.display}`);
      addDiagnostic(`  - Visibility: ${computedStyle.visibility}`);
      addDiagnostic(`  - Opacity: ${computedStyle.opacity}`);
      addDiagnostic(`  - Position: ${rect.top}, ${rect.left}, ${rect.width}x${rect.height}`);
      addDiagnostic(`  - OffsetParent: ${element.offsetParent ? 'exists' : 'null'}`);
    });
  };

  const forceToolbarVisible = () => {
    const toolbars = document.querySelectorAll('.tox-toolbar');
    toolbars.forEach((toolbar, index) => {
      const element = toolbar as HTMLElement;
      element.style.display = 'flex';
      element.style.visibility = 'visible';
      element.style.opacity = '1';
      addDiagnostic(`Forced toolbar ${index} to be visible`);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">TinyMCE Editor Diagnostic Tool</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Editor Test with Tabs</h2>
              
              <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="seo">SEO</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="mt-4">
                  <div ref={editorContainerRef} className="border border-gray-300 rounded-lg p-4">
                    <EnhancedRichTextEditor
                      value={content}
                      onChange={handleContentChange}
                      placeholder="Type here to test toolbar visibility and content persistence..."
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
                </TabsContent>
                
                <TabsContent value="seo" className="mt-4">
                  <div className="p-4 bg-gray-100 rounded">
                    <h3 className="font-semibold mb-2">SEO Tab</h3>
                    <p>This is the SEO tab. Switch back to Content to test persistence.</p>
                    <p>Current content length: {content.length} characters</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="mt-4">
                  <div className="p-4 bg-gray-100 rounded">
                    <h3 className="font-semibold mb-2">Settings Tab</h3>
                    <p>This is the Settings tab. Switch back to Content to test persistence.</p>
                    <p>Current content length: {content.length} characters</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Diagnostics Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Diagnostics</h2>
              
              <div className="space-y-2 mb-4">
                <button
                  onClick={checkToolbarVisibility}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Check Toolbar Visibility
                </button>
                <button
                  onClick={forceToolbarVisible}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Force Toolbar Visible
                </button>
                <button
                  onClick={() => setDiagnostics([])}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear Diagnostics
                </button>
              </div>
              
              <div className="bg-gray-100 rounded p-3 h-96 overflow-y-auto">
                <h3 className="font-semibold mb-2">Diagnostic Log:</h3>
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
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 mt-4">
              <h3 className="text-lg font-semibold mb-2">Current State</h3>
              <div className="text-sm space-y-1">
                <p><strong>Current Tab:</strong> {currentTab}</p>
                <p><strong>Content Length:</strong> {content.length}</p>
                <p><strong>TinyMCE Available:</strong> {typeof window !== 'undefined' && (window as any).tinymce ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorDiagnosticPage;
