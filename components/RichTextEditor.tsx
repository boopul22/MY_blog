import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { TRANSFORMERS } from '@lexical/markdown';
// Simple error boundary component
class SimpleErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lexical editor error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="lexical-error">Something went wrong with the editor.</div>;
    }

    return this.props.children;
  }
}
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';
import { ListItemNode, ListNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $insertNodes, $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, FORMAT_ELEMENT_COMMAND } from 'lexical';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
import { INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND } from '@lexical/list';
import './RichTextEditor.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  height?: number | string;
  disabled?: boolean;
  className?: string;
  autoHeight?: boolean;
}

// Debounce hook for performance optimization - completely stable
const useDebounce = (callback: (value: string) => void, delay: number = 300) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Keep the ref updated with the latest callback
  callbackRef.current = callback;

  // Create a stable debounced function that never changes
  const debouncedCallback = useRef((value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(value);
    }, delay);
  });

  return debouncedCallback.current;
};

// Plugin to handle content changes and sync with parent
function OnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  const [editor] = useLexicalComposerContext();
  const onChangeRef = useRef(onChange);
  const previousContentRef = useRef<string>('');
  const isExternalUpdateRef = useRef(false);

  // Keep the ref updated with the latest onChange callback
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState, dirtyElements, dirtyLeaves }) => {
      // Skip if this is an external update (from InitialContentPlugin)
      if (isExternalUpdateRef.current) {
        isExternalUpdateRef.current = false;
        return;
      }

      // Only process if there are actual changes from user interaction
      if (dirtyElements.size > 0 || dirtyLeaves.size > 0) {
        editorState.read(() => {
          const htmlString = $generateHtmlFromNodes(editor, null);

          // Only trigger onChange if content actually changed
          if (htmlString !== previousContentRef.current) {
            previousContentRef.current = htmlString;
            onChangeRef.current(htmlString);
          }
        });
      }
    });
  }, [editor]);

  return null;
}

// Plugin to set initial content - completely rewritten to prevent loops
function InitialContentPlugin({ initialContent }: { initialContent: string }) {
  const [editor] = useLexicalComposerContext();
  const lastSetContentRef = useRef<string>('');
  const isSettingContentRef = useRef(false);

  useEffect(() => {
    // Only set content if it's different from what we last set
    // and we're not currently in the process of setting content
    if (
      initialContent &&
      initialContent !== lastSetContentRef.current &&
      !isSettingContentRef.current
    ) {
      isSettingContentRef.current = true;

      editor.update(() => {
        const root = $getRoot();
        const currentContent = $generateHtmlFromNodes(editor, null);

        // Only update if the current editor content is different
        if (currentContent !== initialContent) {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialContent, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          root.clear();
          $insertNodes(nodes);
          lastSetContentRef.current = initialContent;
        }

        isSettingContentRef.current = false;
      });
    }
  }, [editor, initialContent]);

  return null;
}

// Simple Toolbar Component
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();

  const formatText = (format: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatHeading = (headingSize: 'h1' | 'h2' | 'h3') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const headingNode = $createHeadingNode(headingSize);
        selection.insertNodes([headingNode]);
      }
    });
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const quoteNode = $createQuoteNode();
        selection.insertNodes([quoteNode]);
      }
    });
  };

  const formatList = (listType: 'bullet' | 'number') => {
    if (listType === 'bullet') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  return (
    <div className="lexical-toolbar">
      <button
        type="button"
        onClick={() => formatText('bold')}
        className="lexical-toolbar-button"
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => formatText('italic')}
        className="lexical-toolbar-button"
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => formatText('underline')}
        className="lexical-toolbar-button"
        title="Underline"
      >
        <u>U</u>
      </button>
      <div className="lexical-toolbar-divider" />
      <button
        type="button"
        onClick={() => formatHeading('h1')}
        className="lexical-toolbar-button"
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => formatHeading('h2')}
        className="lexical-toolbar-button"
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => formatHeading('h3')}
        className="lexical-toolbar-button"
        title="Heading 3"
      >
        H3
      </button>
      <div className="lexical-toolbar-divider" />
      <button
        type="button"
        onClick={() => formatList('bullet')}
        className="lexical-toolbar-button"
        title="Bullet List"
      >
        •
      </button>
      <button
        type="button"
        onClick={() => formatList('number')}
        className="lexical-toolbar-button"
        title="Numbered List"
      >
        1.
      </button>
      <button
        type="button"
        onClick={formatQuote}
        className="lexical-toolbar-button"
        title="Quote"
      >
        "
      </button>
    </div>
  );
}

const RichTextEditor: React.FC<RichTextEditorProps> = React.memo(({
  value,
  onChange,
  placeholder = 'Start writing your content...',
  height = 400,
  disabled = false,
  className = '',
  autoHeight = false
}) => {
  // Debounced onChange to prevent excessive parent updates
  const debouncedOnChange = useDebounce(onChange, 300);

  // Calculate final height
  const finalHeight = useMemo(() => {
    if (autoHeight) {
      return Math.max(300, Math.min(typeof height === 'number' ? height : 500, 800));
    }
    return height;
  }, [height, autoHeight]);

  // Lexical editor configuration
  const initialConfig = useMemo(() => ({
    namespace: 'RichTextEditor',
    theme: {
      root: 'lexical-editor',
      paragraph: 'lexical-paragraph',
      heading: {
        h1: 'lexical-heading-h1',
        h2: 'lexical-heading-h2',
        h3: 'lexical-heading-h3',
        h4: 'lexical-heading-h4',
        h5: 'lexical-heading-h5',
        h6: 'lexical-heading-h6',
      },
      list: {
        nested: {
          listitem: 'lexical-nested-listitem',
        },
        ol: 'lexical-list-ol',
        ul: 'lexical-list-ul',
        listitem: 'lexical-listitem',
      },
      link: 'lexical-link',
      text: {
        bold: 'lexical-text-bold',
        italic: 'lexical-text-italic',
        underline: 'lexical-text-underline',
        strikethrough: 'lexical-text-strikethrough',
        code: 'lexical-text-code',
      },
      code: 'lexical-code',
      codeHighlight: {
        atrule: 'lexical-token-attr',
        attr: 'lexical-token-attr',
        boolean: 'lexical-token-boolean',
        builtin: 'lexical-token-builtin',
        cdata: 'lexical-token-cdata',
        char: 'lexical-token-char',
        class: 'lexical-token-class',
        'class-name': 'lexical-token-class-name',
        comment: 'lexical-token-comment',
        constant: 'lexical-token-constant',
        deleted: 'lexical-token-deleted',
        doctype: 'lexical-token-doctype',
        entity: 'lexical-token-entity',
        function: 'lexical-token-function',
        important: 'lexical-token-important',
        inserted: 'lexical-token-inserted',
        keyword: 'lexical-token-keyword',
        namespace: 'lexical-token-namespace',
        number: 'lexical-token-number',
        operator: 'lexical-token-operator',
        prolog: 'lexical-token-prolog',
        property: 'lexical-token-property',
        punctuation: 'lexical-token-punctuation',
        regex: 'lexical-token-regex',
        selector: 'lexical-token-selector',
        string: 'lexical-token-string',
        symbol: 'lexical-token-symbol',
        tag: 'lexical-token-tag',
        url: 'lexical-token-url',
        variable: 'lexical-token-variable',
      },
    },
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
  }), []);

  return (
    <div
      className={`rich-text-editor ${className}`}
      style={{
        minHeight: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <div className="lexical-editor-container">
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="lexical-content-editable"
                style={{
                  minHeight: typeof finalHeight === 'number' ? `${finalHeight - 100}px` : 'auto',
                  outline: 'none',
                  padding: '16px',
                  fontSize: '14px',
                  lineHeight: '1.6',
                }}
                placeholder={
                  <div className="lexical-placeholder">
                    {placeholder}
                  </div>
                }
                readOnly={disabled}
              />
            }
            ErrorBoundary={SimpleErrorBoundary}
          />
          <OnChangePlugin onChange={debouncedOnChange} />
          <InitialContentPlugin initialContent={value} />

          <AutoFocusPlugin />
          <LinkPlugin />
          <ListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        </div>
      </LexicalComposer>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  // Note: We don't compare onChange since it's now properly memoized in the parent
  return (
    prevProps.value === nextProps.value &&
    prevProps.placeholder === nextProps.placeholder &&
    prevProps.height === nextProps.height &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.className === nextProps.className &&
    prevProps.autoHeight === nextProps.autoHeight
  );
});

// Add display name for debugging
RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;