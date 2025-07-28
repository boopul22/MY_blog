import React, { useRef, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { BlogContext } from '../context/SupabaseBlogContext';

interface EnhancedRichTextEditorProps {
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

const EnhancedRichTextEditor: React.FC<EnhancedRichTextEditorProps> = ({
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const currentContentRef = useRef<string>(value);

  // Handle image upload
  const handleImageUpload = useCallback(async (blobInfo: any, progress: (percent: number) => void) => {
    try {
      if (!uploadPostImage) {
        throw new Error('Image upload not available');
      }

      const file = blobInfo.blob();
      progress(0);
      
      const imageUrl = await uploadPostImage(file);
      progress(100);
      
      return imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw error;
    }
  }, [uploadPostImage]);

  // Build comprehensive plugin list based on enabled features
  const getPlugins = () => {
    const basePlugins = [
      'advlist', 'autolink', 'lists', 'link', 'charmap', 'anchor',
      'searchreplace', 'visualblocks', 'wordcount', 'help'
    ];

    if (enableMediaUpload) basePlugins.push('image', 'media');
    if (enableTables) basePlugins.push('table');
    if (enableSourceCode) basePlugins.push('code');
    if (enableFullScreen) basePlugins.push('fullscreen');
    if (enableAdvancedFormatting) basePlugins.push('emoticons');
    if (enableEmbeds) basePlugins.push('media');

    return basePlugins;
  };

  // Build comprehensive toolbar based on enabled features
  const getToolbar = () => {
    let toolbar1 = 'undo redo | ';

    // Format dropdown and basic formatting
    toolbar1 += 'blocks fontfamily fontsize | ';
    toolbar1 += 'bold italic underline strikethrough | ';

    // Alignment
    toolbar1 += 'align';

    let toolbar2 = 'bullist numlist outdent indent | ';

    // Links and media
    if (enableLinking) toolbar2 += 'link unlink | ';
    if (enableMediaUpload) toolbar2 += 'image media | ';

    // Tables
    if (enableTables) toolbar2 += 'table | ';

    // Advanced features
    toolbar2 += 'blockquote hr | ';
    if (enableSourceCode) toolbar2 += 'code | ';
    if (enableFullScreen) toolbar2 += 'fullscreen | ';

    toolbar2 += 'help';

    return [toolbar1, toolbar2];
  };

  // TinyMCE configuration
  const editorConfig = useMemo(() => {
    const toolbars = getToolbar();
    
    return {
      // License key for TinyMCE 8.x (use 'gpl' for open source)
      license_key: 'gpl',

      // Basic configuration
      height: autoHeight ? 'auto' : (typeof height === 'number' ? Math.max(height, 300) : (height || 400)),
      min_height: 300,
      max_height: autoHeight ? 800 : undefined,
      menubar: false,
      statusbar: showWordCount,
      resize: true,

      // Comprehensive plugins
      plugins: getPlugins(),

      // Multi-row toolbar
      toolbar1: toolbars[0],
      toolbar2: toolbars[1],
      toolbar_mode: 'sliding',

      // Content settings
      placeholder: placeholder || 'Start writing your content...',
      browser_spellcheck: true,
      paste_data_images: enableMediaUpload,
      paste_as_text: false,

      // Content structure
      forced_root_block: 'p',
      forced_root_block_attrs: {},
      remove_trailing_brs: false,

      // Format options - using modern TinyMCE 7.0 format
      block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre; Blockquote=blockquote',

      // Font options - using modern TinyMCE 7.0 format
      font_family_formats: 'Arial=arial,helvetica,sans-serif; Georgia=georgia,serif; Times New Roman=times new roman,times,serif; Courier New=courier new,courier,monospace; Verdana=verdana,geneva,sans-serif; Helvetica=helvetica,arial,sans-serif; Impact=impact,sans-serif; Tahoma=tahoma,arial,helvetica,sans-serif',
      font_size_formats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 24pt 30pt 36pt 48pt 60pt 72pt 96pt',

      // Disable external requests
      branding: false,
      promotion: false,
      verify_html: false,
      cleanup: false,
      convert_urls: false,

      // Enhanced content styling
      content_style: `
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: #374151;
          margin: 1rem;
          max-width: none;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          line-height: 1.25;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          color: #1f2937;
        }
        
        h1 { font-size: 2.25em; }
        h2 { font-size: 1.875em; }
        h3 { font-size: 1.5em; }
        h4 { font-size: 1.25em; }
        h5 { font-size: 1.125em; }
        h6 { font-size: 1em; }
        
        blockquote {
          border-left: 4px solid #3b82f6;
          margin: 1.5em 0;
          padding: 0.5em 1em;
          background-color: #f8fafc;
          font-style: italic;
          color: #64748b;
        }
        
        code {
          background-color: #f1f5f9;
          padding: 0.125em 0.25em;
          border-radius: 0.25em;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
          font-size: 0.875em;
          color: #e11d48;
        }
        
        pre {
          background-color: #1e293b;
          color: #f1f5f9;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
          line-height: 1.4;
        }
        
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
          border: 1px solid #e2e8f0;
        }
        
        table td, table th {
          border: 1px solid #e2e8f0;
          padding: 0.75em;
          text-align: left;
        }
        
        table th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #374151;
        }
        
        table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        hr {
          border: none;
          border-top: 2px solid #e2e8f0;
          margin: 2em 0;
        }
        
        .mce-content-body img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
        }
        
        .mce-content-body a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .mce-content-body a:hover {
          color: #1d4ed8;
        }
        
        ul, ol {
          padding-left: 1.5em;
        }
        
        li {
          margin-bottom: 0.25em;
        }
      `,

      // Image upload configuration
      images_upload_handler: enableMediaUpload ? handleImageUpload : undefined,
      automatic_uploads: enableMediaUpload,
      file_picker_types: enableMediaUpload ? 'image' : undefined,
      images_upload_credentials: false,
      images_reuse_filename: true,

      // Table configuration
      table_default_attributes: {
        border: '1'
      },
      table_default_styles: {
        'border-collapse': 'collapse',
        'width': '100%'
      },

      // Link configuration
      link_assume_external_targets: true,
      link_context_toolbar: true,
      link_title: false,

      // Advanced list configuration
      advlist_bullet_styles: 'disc,circle,square',
      advlist_number_styles: 'decimal,lower-alpha,lower-roman,upper-alpha,upper-roman',

      // Setup function to handle editor events and custom functionality
      setup: (editor: any) => {
        // Auto-save functionality
        if (enableAutoSave && onAutoSave) {
          let autoSaveTimer: NodeJS.Timeout;

          editor.on('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
              const content = editor.getContent();
              onAutoSave(content);
            }, autoSaveDelay);
          });
        }

        // Keyboard shortcuts
        if (enableKeyboardShortcuts) {
          // Save shortcut (Ctrl+S)
          editor.addShortcut('ctrl+s', 'Save content', () => {
            if (onAutoSave) {
              onAutoSave(editor.getContent());
            }
          });

          // Custom shortcuts
          editor.addShortcut('ctrl+shift+x', 'Strikethrough', () => {
            editor.execCommand('Strikethrough');
          });

          editor.addShortcut('ctrl+shift+c', 'Code format', () => {
            editor.execCommand('mceToggleFormat', false, 'code');
          });

          editor.addShortcut('ctrl+shift+q', 'Blockquote', () => {
            editor.execCommand('mceToggleFormat', false, 'blockquote');
          });

          editor.addShortcut('ctrl+shift+h', 'Horizontal rule', () => {
            editor.execCommand('InsertHorizontalRule');
          });
        }

        // Custom buttons and functionality
        if (enableAnchorLinks) {
          editor.ui.registry.addButton('anchor', {
            text: 'Anchor',
            tooltip: 'Insert anchor link',
            onAction: () => {
              editor.windowManager.open({
                title: 'Insert Anchor',
                body: {
                  type: 'panel',
                  items: [
                    {
                      type: 'input',
                      name: 'anchor',
                      label: 'Anchor ID',
                      placeholder: 'my-anchor-id'
                    }
                  ]
                },
                buttons: [
                  {
                    type: 'cancel',
                    text: 'Cancel'
                  },
                  {
                    type: 'submit',
                    text: 'Insert',
                    primary: true
                  }
                ],
                onSubmit: (api: any) => {
                  const data = api.getData();
                  if (data.anchor) {
                    editor.insertContent(`<a id="${data.anchor}"></a>`);
                  }
                  api.close();
                }
              });
            }
          });
        }

        // Internal linking functionality
        if (enableLinking && posts.length > 0) {
          editor.ui.registry.addButton('internallink', {
            text: 'Internal Link',
            tooltip: 'Link to internal post',
            onAction: () => {
              const selectedText = editor.selection.getContent({ format: 'text' });

              editor.windowManager.open({
                title: 'Insert Internal Link',
                body: {
                  type: 'panel',
                  items: [
                    {
                      type: 'selectbox',
                      name: 'post',
                      label: 'Select Post',
                      items: posts.map(post => ({ text: post.title, value: post.slug }))
                    },
                    {
                      type: 'input',
                      name: 'text',
                      label: 'Link Text',
                      value: selectedText
                    }
                  ]
                },
                buttons: [
                  {
                    type: 'cancel',
                    text: 'Cancel'
                  },
                  {
                    type: 'submit',
                    text: 'Insert',
                    primary: true
                  }
                ],
                onSubmit: (api: any) => {
                  const data = api.getData();
                  if (data.post && data.text) {
                    const linkHtml = `<a href="/post/${data.post}">${data.text}</a>`;
                    editor.insertContent(linkHtml);
                  }
                  api.close();
                }
              });
            }
          });
        }

        // Excerpt generation
        if (onExcerptGenerate) {
          editor.ui.registry.addButton('generateexcerpt', {
            text: 'Generate Excerpt',
            tooltip: 'Generate excerpt from content',
            onAction: () => {
              const content = editor.getContent({ format: 'text' });
              const words = content.trim().split(/\s+/);
              const excerpt = words.slice(0, 30).join(' ') + (words.length > 30 ? '...' : '');
              onExcerptGenerate(excerpt);
            }
          });
        }

        // Content change monitoring
        editor.on('input', () => {
          try {
            const content = editor.getContent();

            // Update word count
            const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
            setCharacterCount(content.replace(/<[^>]*>/g, '').length);
          } catch (error) {
            console.error('Error updating word count:', error);
          }
        });

        // Full screen toggle
        editor.on('FullscreenStateChanged', (e: any) => {
          setIsFullScreen(e.state);
        });

        // Initialize editor
        editor.on('init', () => {
          setIsInitialized(true);
          setIsLoading(false);
        });

        // Prevent content clearing on focus/blur
        editor.on('focus', () => {
          console.log('Editor focused, current content length:', editor.getContent().length);
        });

        editor.on('blur', () => {
          console.log('Editor blurred, current content length:', editor.getContent().length);
        });
      }
    };
  }, [
    height, autoHeight, placeholder, enableMediaUpload, enableTables, enableSourceCode, 
    enableFullScreen, enableAdvancedFormatting, enableEmbeds, enableCustomStyles, 
    enableAnchorLinks, enableLinking, enableKeyboardShortcuts, handleImageUpload, showWordCount
  ]);

  // Handle value prop changes from parent
  useEffect(() => {
    if (editorRef.current && isInitialized && typeof editorRef.current.getContent === 'function') {
      try {
        const currentEditorContent = editorRef.current.getContent();

        // Only update editor if the value prop is different from current content
        if (value !== currentEditorContent && value !== currentContentRef.current) {
          console.log('Updating editor content from prop change');
          editorRef.current.setContent(value || '', { format: 'html' });
          currentContentRef.current = value;
        }
      } catch (error) {
        console.error('Error updating editor content:', error);
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
    <div className={`rich-text-editor ${className} ${isFullScreen ? 'fullscreen' : ''}`}>
      {isLoading && (
        <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading editor...</span>
        </div>
      )}

      <div className={isLoading ? 'hidden' : ''}>
        <Editor
          ref={editorRef}
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          value={value}
          onEditorChange={(content) => {
            try {
              currentContentRef.current = content;
              onChange(content);
            } catch (error) {
              console.error('Error in onEditorChange:', error);
            }
          }}
          disabled={disabled}
          init={editorConfig}
          onBeforeSetContent={(evt) => {
            try {
              // Only allow content updates if they're different from current content
              const newContent = evt.content;
              if (currentContentRef.current === newContent) {
                evt.preventDefault();
              }
            } catch (error) {
              console.error('Error in onBeforeSetContent:', error);
            }
          }}
        />
      </div>

      {/* Word Count and Statistics */}
      {(showWordCount || showDetailedStats) && !isLoading && (
        <div className="mt-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
          <div className="flex items-center space-x-4">
            {showWordCount && (
              <>
                <span>Words: {wordCount}</span>
                <span>Characters: {characterCount}</span>
              </>
            )}
            {showDetailedStats && (
              <>
                <span>Paragraphs: {(value.match(/<p[^>]*>/g) || []).length}</span>
                <span>Images: {(value.match(/<img[^>]*>/g) || []).length}</span>
                <span>Links: {(value.match(/<a[^>]*>/g) || []).length}</span>
              </>
            )}
          </div>

          {enableKeyboardShortcuts && (
            <div className="text-xs text-gray-400">
              Ctrl+S: Save | Ctrl+Shift+C: Code | Ctrl+Shift+Q: Quote
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnhancedRichTextEditor;
