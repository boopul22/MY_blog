import React, { Suspense } from 'react';

// Lazy load the heavy TinyMCE editor
const EnhancedRichTextEditor = React.lazy(() => import('./EnhancedRichTextEditor'));

interface LazyEnhancedRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number | string;
  disabled?: boolean;
  className?: string;
  onSave?: () => void;
  onPublish?: () => void;
  showToolbar?: boolean;
}

const EditorLoadingFallback: React.FC = () => (
  <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground text-sm">Loading enhanced editor...</p>
    </div>
  </div>
);

const LazyEnhancedRichTextEditor: React.FC<LazyEnhancedRichTextEditorProps> = (props) => {
  return (
    <Suspense fallback={<EditorLoadingFallback />}>
      <EnhancedRichTextEditor {...props} />
    </Suspense>
  );
};

export default LazyEnhancedRichTextEditor;
