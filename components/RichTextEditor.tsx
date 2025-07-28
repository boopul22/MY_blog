import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { BlogContext } from '../context/SupabaseBlogContext';
import { useDebounce } from '../hooks/useDebounce';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number | string;
  disabled?: boolean;
  className?: string;
  autoHeight?: boolean;
  // Enhanced features
  enableAutoSave?: boolean;
  autoSaveDelay?: number;
  onAutoSave?: (content: string) => Promise<void>;
  showWordCount?: boolean;
  showDetailedStats?: boolean;
  enableKeyboardShortcuts?: boolean;
  enableMediaUpload?: boolean;
  enableLinking?: boolean;
  enableTables?: boolean;
  // WordPress-like features
  enableFullScreen?: boolean;
  enableSourceCode?: boolean;
  enableAdvancedFormatting?: boolean;
  enableCustomStyles?: boolean;
  enableEmbeds?: boolean;
  enableAnchorLinks?: boolean;
  posts?: Array<{id: string; title: string; slug: string}>; // For internal linking
  onExcerptGenerate?: (excerpt: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  height = 400,
  disabled = false,
  className = '',
  autoHeight = false,
  enableAutoSave = true,
  autoSaveDelay = 30000,
  onAutoSave,
  showWordCount = true,
  showDetailedStats = false,
  enableKeyboardShortcuts = true,
  enableMediaUpload = true,
  enableLinking = true,
  enableTables = true,
  enableFullScreen = true,
  enableSourceCode = true,
  enableAdvancedFormatting = true,
  enableCustomStyles = true,
  enableEmbeds = true,
  enableAnchorLinks = true,
  posts = [],
  onExcerptGenerate
}) => {
  const { uploadPostImage } = useContext(BlogContext);
  const editorRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);

  // Store the current content to prevent unnecessary updates
  const currentContentRef = useRef(value);

  // Update ref when value prop changes
  useEffect(() => {
    currentContentRef.current = value;
  }, [value]);

  // Handle editor content changes - IMMEDIATE update for typing, debounced for parent
  const handleEditorChange = useCallback((content: string) => {
    // Prevent infinite loops by checking if content actually changed
    if (currentContentRef.current === content) {
      return;
    }

    // Update our ref immediately
    currentContentRef.current = content;

    // Call parent onChange immediately for responsive typing
    onChange(content);

    // Update statistics
    const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharacterCount(content.replace(/<[^>]*>/g, '').length);
  }, [onChange]);

  // Handle image upload
  const handleImageUpload = useCallback(async (blobInfo: any, progress: (percent: number) => void) => {
    if (!uploadPostImage) {
      throw new Error('Image upload not available');
    }

    try {
      progress(0);
      const file = blobInfo.blob();
      progress(50);
      const imageUrl = await uploadPostImage(file);
      progress(100);
      return imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }, [uploadPostImage]);

  // TinyMCE configuration - Optimized to prevent content clearing
  const editorConfig = useMemo(() => ({
    // License key for TinyMCE 8.x (use 'gpl' for open source)
    license_key: 'gpl',

    // Basic configuration
    height: typeof height === 'number' ? Math.max(height, 300) : (height || 400),
    menubar: false,
    statusbar: true,

    // Essential plugins only
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount'
    ],

    // Simplified toolbar
    toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code | help',

    // Basic content settings
    placeholder: placeholder || 'Start writing your content...',

    // Content behavior - Prevent content clearing
    browser_spellcheck: true,
    paste_data_images: enableMediaUpload,

    // Prevent content clearing issues
    forced_root_block: 'p',
    forced_root_block_attrs: {},
    remove_trailing_brs: false,

    // Disable external requests that might cause issues
    branding: false,
    promotion: false,

    // Prevent auto-cleanup that might clear content
    verify_html: false,
    cleanup: false,
    convert_urls: false,

    // Content styling
    content_style: `
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
        margin: 1rem;
      }
    `,

    // Image upload configuration
    images_upload_handler: enableMediaUpload ? handleImageUpload : undefined,
    automatic_uploads: enableMediaUpload,
    file_picker_types: enableMediaUpload ? 'image' : undefined,

    // Setup function to handle editor events
    setup: (editor: any) => {
      // Prevent content clearing on focus/blur
      editor.on('focus', () => {
        console.log('Editor focused, current content length:', editor.getContent().length);
      });

      editor.on('blur', () => {
        console.log('Editor blurred, current content length:', editor.getContent().length);
      });

      // Monitor content changes for debugging
      editor.on('input', () => {
        const content = editor.getContent();
        console.log('Editor input event, content length:', content.length);
      });
    }
  }), [
    height, placeholder, enableMediaUpload, handleImageUpload
  ]);

  // Handle value prop changes from parent
  useEffect(() => {
    if (editorRef.current && isInitialized) {
      const currentEditorContent = editorRef.current.getContent();

      // Only update editor if the value prop is different from current content
      if (value !== currentEditorContent && value !== currentContentRef.current) {
        console.log('Updating editor content from prop change');
        editorRef.current.setContent(value || '', { format: 'html' });
        currentContentRef.current = value;
      }
    }
  }, [value, isInitialized]);

  // Initialize statistics on mount and when content changes
  useEffect(() => {
    if (value) {
      const words = value.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
      setCharacterCount(value.replace(/<[^>]*>/g, '').length);
    } else {
      setWordCount(0);
      setCharacterCount(0);
    }
  }, [value]);

  return (
    <div className={`tinymce-editor-container ${className}`}>
      <div className="editor-wrapper border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
        {isLoading && (
          <div className="tinymce-loading">
            Loading TinyMCE editor...
          </div>
        )}
        <Editor
          ref={editorRef}
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY || 'no-api-key'}
          value={value}
          onEditorChange={handleEditorChange}
          disabled={disabled}
          init={editorConfig}
          // Prevent TinyMCE from overriding content during typing
          onBeforeSetContent={(evt) => {
            // Only allow content updates if they're different from current content
            const newContent = evt.content;
            if (currentContentRef.current === newContent) {
              evt.preventDefault();
            }
          }}
          onInit={(evt, editor) => {
            console.log('TinyMCE initialized successfully:', editor);

            // Store editor reference
            editorRef.current = editor;

            // Set the initial content if provided
            if (value && value !== editor.getContent()) {
              editor.setContent(value, { format: 'html' });
            }

            // Set initialization state
            setIsInitialized(true);
            setIsLoading(false);

            // Focus the editor if not disabled
            if (!disabled) {
              setTimeout(() => {
                try {
                  editor.focus();
                  console.log('Editor focused successfully');
                } catch (error) {
                  console.warn('Could not focus editor:', error);
                }
              }, 100);
            }

            // Add additional event listeners for debugging
            editor.on('SetContent', (e: any) => {
              console.log('SetContent event:', e.content?.length || 0, 'characters');
            });

            editor.on('GetContent', (e: any) => {
              console.log('GetContent event:', e.content?.length || 0, 'characters');
            });
          }}
          onError={(error) => {
            console.error('TinyMCE Error:', error);
            setIsLoading(false);
          }}
        />
      </div>
      
      {/* Word Count and Statistics */}
      {showWordCount && (
        <div className="editor-stats">
          <span>📝 {wordCount} words</span>
          <span>🔤 {characterCount} characters</span>
          {showDetailedStats && (
            <span>⏱️ {Math.ceil(wordCount / 200)} min read</span>
          )}
        </div>
      )}
    </div>
  );
};

// Add display name for debugging
RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
