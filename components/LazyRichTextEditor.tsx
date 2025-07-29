import React, { Suspense } from 'react';

// Lazy load the heavy TinyMCE editor
const RichTextEditor = React.lazy(() => import('./RichTextEditor'));

interface LazyRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number | string;
  disabled?: boolean;
  className?: string;
}

const EditorLoadingFallback: React.FC = () => (
  <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 min-h-[400px] flex items-center justify-center bg-gray-50 dark:bg-gray-800">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground text-sm">Loading editor...</p>
    </div>
  </div>
);

const LazyRichTextEditor: React.FC<LazyRichTextEditorProps> = (props) => {
  return (
    <Suspense fallback={<EditorLoadingFallback />}>
      <RichTextEditor {...props} />
    </Suspense>
  );
};

export default LazyRichTextEditor;
