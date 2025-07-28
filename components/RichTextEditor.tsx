import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import TableManager from './TableManager';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number;
  disabled?: boolean;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  height = 500,
  disabled = false,
  className = '',
}) => {
  const editorRef = useRef<any>(null);
  const [showTableManager, setShowTableManager] = useState(false);

  // TinyMCE configuration
  const editorConfig = {
    height,
    menubar: true,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'codesample',
      'emoticons', 'template', 'paste', 'textcolor', 'colorpicker', 'textpattern',
      'nonbreaking', 'pagebreak', 'save', 'directionality', 'visualchars',
      'noneditable', 'charmap', 'quickbars', 'accordion'
    ],
    toolbar: [
      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table advancedTable mergetags | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
      'forecolor backcolor | codesample callouts | template | fullscreen preview save print | pagebreak anchor | ltr rtl'
    ],
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    quickbars_insert_toolbar: 'quickimage quicktable',
    toolbar_mode: 'sliding',
    contextmenu: 'link image table',
    skin: 'oxide',
    content_css: 'default',
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        font-size: 16px; 
        line-height: 1.6;
        color: #1a202c;
      }
      .dark body {
        color: #f7fafc;
        background-color: #2d3748;
      }
      h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      h1 { font-size: 2.25em; }
      h2 { font-size: 1.875em; }
      h3 { font-size: 1.5em; }
      h4 { font-size: 1.25em; }
      h5 { font-size: 1.125em; }
      h6 { font-size: 1em; }
      p { margin-bottom: 1em; }
      blockquote {
        border-left: 4px solid #007bff;
        padding-left: 1em;
        margin: 1.5em 0;
        font-style: italic;
        background-color: #f8f9fa;
        padding: 1em;
        border-radius: 0.375rem;
      }
      .dark blockquote {
        background-color: #4a5568;
        border-left-color: #63b3ed;
      }
      code {
        background-color: #f1f5f9;
        padding: 0.125em 0.25em;
        border-radius: 0.25rem;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875em;
      }
      .dark code {
        background-color: #4a5568;
      }
      pre {
        background-color: #1e293b;
        color: #e2e8f0;
        padding: 1em;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1em 0;
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }
      table, th, td {
        border: 1px solid #e2e8f0;
      }
      .dark table, .dark th, .dark td {
        border-color: #4a5568;
      }
      th, td {
        padding: 0.75em;
        text-align: left;
      }
      th {
        background-color: #f8f9fa;
        font-weight: 600;
      }
      .dark th {
        background-color: #4a5568;
      }
      img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1em 0;
      }
      .callout {
        padding: 1em;
        margin: 1em 0;
        border-radius: 0.5rem;
        border-left: 4px solid;
      }
      .callout-info {
        background-color: #eff6ff;
        border-left-color: #3b82f6;
        color: #1e40af;
      }
      .callout-warning {
        background-color: #fffbeb;
        border-left-color: #f59e0b;
        color: #92400e;
      }
      .callout-error {
        background-color: #fef2f2;
        border-left-color: #ef4444;
        color: #dc2626;
      }
      .callout-success {
        background-color: #f0fdf4;
        border-left-color: #22c55e;
        color: #166534;
      }
    `,
    placeholder,
    branding: false,
    promotion: false,
    license_key: 'gpl',
    
    // Advanced features
    paste_data_images: true,
    paste_as_text: false,
    paste_webkit_styles: 'none',
    paste_remove_styles_if_webkit: true,
    
    // Image handling
    images_upload_handler: (blobInfo: any, progress: any) => new Promise((resolve, reject) => {
      // This will be handled by the parent component
      const base64 = `data:${blobInfo.blob().type};base64,${blobInfo.base64()}`;
      resolve(base64);
    }),
    
    // Table options
    table_default_attributes: {
      border: '1'
    },
    table_default_styles: {
      'border-collapse': 'collapse',
      'width': '100%'
    },
    
    // Code sample configuration
    codesample_languages: [
      { text: 'HTML/XML', value: 'markup' },
      { text: 'JavaScript', value: 'javascript' },
      { text: 'TypeScript', value: 'typescript' },
      { text: 'CSS', value: 'css' },
      { text: 'Python', value: 'python' },
      { text: 'Java', value: 'java' },
      { text: 'C#', value: 'csharp' },
      { text: 'PHP', value: 'php' },
      { text: 'Ruby', value: 'ruby' },
      { text: 'Go', value: 'go' },
      { text: 'Rust', value: 'rust' },
      { text: 'SQL', value: 'sql' },
      { text: 'JSON', value: 'json' },
      { text: 'Bash', value: 'bash' },
    ],
    
    // Custom templates
    templates: [
      {
        title: 'Article Template',
        description: 'Standard article layout',
        content: `
          <h1>Article Title</h1>
          <p><em>Brief introduction or summary...</em></p>
          <h2>Section 1</h2>
          <p>Content goes here...</p>
          <h2>Section 2</h2>
          <p>More content...</p>
          <h2>Conclusion</h2>
          <p>Wrap up your thoughts...</p>
        `
      },
      {
        title: 'Tutorial Template',
        description: 'Step-by-step tutorial layout',
        content: `
          <h1>Tutorial: [Title]</h1>
          <div class="callout callout-info">
            <p><strong>What you'll learn:</strong> Brief overview of tutorial goals</p>
          </div>
          <h2>Prerequisites</h2>
          <ul>
            <li>Requirement 1</li>
            <li>Requirement 2</li>
          </ul>
          <h2>Step 1: [Step Title]</h2>
          <p>Instructions...</p>
          <h2>Step 2: [Step Title]</h2>
          <p>Instructions...</p>
          <h2>Conclusion</h2>
          <p>Summary and next steps...</p>
        `
      },
      {
        title: 'Review Template',
        description: 'Product or service review layout',
        content: `
          <h1>[Product/Service] Review</h1>
          <h2>Overview</h2>
          <p>Brief introduction...</p>
          <h2>Pros</h2>
          <ul>
            <li>Positive point 1</li>
            <li>Positive point 2</li>
          </ul>
          <h2>Cons</h2>
          <ul>
            <li>Negative point 1</li>
            <li>Negative point 2</li>
          </ul>
          <h2>Final Verdict</h2>
          <p>Overall assessment and recommendation...</p>
        `
      }
    ],

    // Setup function for additional customizations
    setup: (editor: any) => {
      // Add custom table manager button
      editor.ui.registry.addButton('advancedTable', {
        text: 'Advanced Table',
        onAction: () => {
          setShowTableManager(true);
        }
      });

      // Add custom buttons
      editor.ui.registry.addButton('callout', {
        text: 'Callout',
        onAction: () => {
          editor.windowManager.open({
            title: 'Insert Callout',
            body: {
              type: 'panel',
              items: [
                {
                  type: 'selectbox',
                  name: 'type',
                  label: 'Callout Type',
                  items: [
                    { text: 'Info', value: 'info' },
                    { text: 'Warning', value: 'warning' },
                    { text: 'Error', value: 'error' },
                    { text: 'Success', value: 'success' }
                  ]
                },
                {
                  type: 'textarea',
                  name: 'content',
                  label: 'Content',
                  placeholder: 'Enter callout content...'
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
              const calloutHtml = `<div class="callout callout-${data.type}"><p>${data.content}</p></div>`;
              editor.insertContent(calloutHtml);
              api.close();
            }
          });
        }
      });

      // Add callout to toolbar
      editor.ui.registry.addMenuButton('callouts', {
        text: 'Callouts',
        fetch: (callback: any) => {
          const items = [
            {
              type: 'menuitem',
              text: 'Info Callout',
              onAction: () => {
                const content = editor.selection.getContent() || 'Your info message here...';
                editor.insertContent(`<div class="callout callout-info"><p>${content}</p></div>`);
              }
            },
            {
              type: 'menuitem',
              text: 'Warning Callout',
              onAction: () => {
                const content = editor.selection.getContent() || 'Your warning message here...';
                editor.insertContent(`<div class="callout callout-warning"><p>${content}</p></div>`);
              }
            },
            {
              type: 'menuitem',
              text: 'Error Callout',
              onAction: () => {
                const content = editor.selection.getContent() || 'Your error message here...';
                editor.insertContent(`<div class="callout callout-error"><p>${content}</p></div>`);
              }
            },
            {
              type: 'menuitem',
              text: 'Success Callout',
              onAction: () => {
                const content = editor.selection.getContent() || 'Your success message here...';
                editor.insertContent(`<div class="callout callout-success"><p>${content}</p></div>`);
              }
            }
          ];
          callback(items);
        }
      });
    }
  };

  const handleEditorChange = (content: string) => {
    onChange(content);
  };

  const handleInsertTable = (tableHtml: string) => {
    if (editorRef.current) {
      editorRef.current.insertContent(tableHtml);
    }
  };

  return (
    <>
      <div className={`rich-text-editor ${className}`}>
        <Editor
          apiKey={import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key"}
          onInit={(evt, editor) => editorRef.current = editor}
          value={value}
          init={editorConfig}
          onEditorChange={handleEditorChange}
          disabled={disabled}
        />
      </div>

      {showTableManager && (
        <TableManager
          onInsertTable={handleInsertTable}
          onClose={() => setShowTableManager(false)}
        />
      )}
    </>
  );
};

export default RichTextEditor;
