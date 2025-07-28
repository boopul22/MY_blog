import React from 'react';
import CodeBlock from '../components/CodeBlock';

// Enhanced content renderer that processes HTML content and adds syntax highlighting
export const renderEnhancedContent = (htmlContent: string): JSX.Element => {
  // Parse HTML and replace code blocks with enhanced CodeBlock components
  const processCodeBlocks = (html: string): string => {
    // Match TinyMCE code sample blocks
    const codeBlockRegex = /<pre[^>]*class="language-([^"]*)"[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/g;
    
    return html.replace(codeBlockRegex, (match, language, code) => {
      // Decode HTML entities in code
      const decodedCode = code
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      // Create a unique ID for this code block
      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;
      
      return `<div id="${codeId}" data-language="${language}" data-code="${encodeURIComponent(decodedCode)}" class="enhanced-code-block"></div>`;
    });
  };

  const processedHtml = processCodeBlocks(htmlContent);

  return (
    <div 
      className="enhanced-content prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

// Hook to enhance code blocks after content is rendered
export const useEnhancedCodeBlocks = () => {
  React.useEffect(() => {
    const enhanceCodeBlocks = () => {
      const codeBlocks = document.querySelectorAll('.enhanced-code-block');
      
      codeBlocks.forEach((block) => {
        const language = block.getAttribute('data-language') || 'text';
        const encodedCode = block.getAttribute('data-code') || '';
        const code = decodeURIComponent(encodedCode);
        
        // Create React element and render it
        const codeBlockElement = React.createElement(CodeBlock, {
          code,
          language,
          showLineNumbers: true,
        });
        
        // This is a simplified approach - in a real implementation,
        // you might want to use a more sophisticated rendering method
        block.innerHTML = `
          <div class="code-block-container">
            <div class="code-block-header bg-gray-800 text-gray-200 px-4 py-2 flex justify-between items-center rounded-t-lg">
              <span class="text-sm font-medium">${getLanguageDisplayName(language)}</span>
              <button onclick="copyCodeToClipboard('${encodedCode}')" class="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition-colors">
                Copy
              </button>
            </div>
            <pre class="code-block !mt-0 !rounded-t-none"><code class="language-${language}">${code}</code></pre>
          </div>
        `;
      });
      
      // Re-run Prism highlighting
      if (window.Prism) {
        window.Prism.highlightAll();
      }
    };

    enhanceCodeBlocks();
  }, []);
};

const getLanguageDisplayName = (lang: string): string => {
  const languageMap: { [key: string]: string } = {
    'javascript': 'JavaScript',
    'typescript': 'TypeScript',
    'jsx': 'JSX',
    'tsx': 'TSX',
    'css': 'CSS',
    'scss': 'SCSS',
    'python': 'Python',
    'java': 'Java',
    'csharp': 'C#',
    'php': 'PHP',
    'ruby': 'Ruby',
    'go': 'Go',
    'rust': 'Rust',
    'sql': 'SQL',
    'json': 'JSON',
    'bash': 'Bash',
    'markdown': 'Markdown',
    'yaml': 'YAML',
    'docker': 'Docker',
    'markup': 'HTML',
  };
  return languageMap[lang] || lang.toUpperCase();
};

// Global function for copy functionality
declare global {
  interface Window {
    copyCodeToClipboard: (encodedCode: string) => void;
  }
}

if (typeof window !== 'undefined') {
  window.copyCodeToClipboard = async (encodedCode: string) => {
    try {
      const code = decodeURIComponent(encodedCode);
      await navigator.clipboard.writeText(code);
      
      // Show temporary feedback
      const event = new CustomEvent('code-copied');
      window.dispatchEvent(event);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };
}
