import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface CodeBlockEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (codeHtml: string) => void;
  initialCode?: string;
  initialLanguage?: string;
}

const CodeBlockEditor: React.FC<CodeBlockEditorProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialCode = '',
  initialLanguage = 'javascript'
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  // Popular programming languages
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'scss', label: 'SCSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'sql', label: 'SQL' },
    { value: 'dockerfile', label: 'Dockerfile' },
    { value: 'nginx', label: 'Nginx' },
    { value: 'apache', label: 'Apache' },
    { value: 'plaintext', label: 'Plain Text' }
  ];

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
      setLanguage(initialLanguage);
    }
  }, [isOpen, initialCode, initialLanguage]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      return;
    }

    // Create HTML for code block with syntax highlighting
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const codeHtml = `<pre class="language-${language}${showLineNumbers ? ' line-numbers' : ''}"><code class="language-${language}">${escapedCode}</code></pre>`;
    
    onInsert(codeHtml);
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    setCode('');
    setLanguage('javascript');
    setShowLineNumbers(true);
    onClose();
  };

  // Get line count for preview
  const lineCount = code.split('\n').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleCancel}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Insert Code Block
                </h3>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-gray-800 px-4 pb-4 sm:p-6 sm:pt-0">
              {/* Language and options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Programming Language
                  </label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {languages.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center h-5">
                    <input
                      id="line-numbers"
                      type="checkbox"
                      checked={showLineNumbers}
                      onChange={(e) => setShowLineNumbers(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="line-numbers" className="font-medium text-gray-700 dark:text-gray-300">
                      Show line numbers
                    </label>
                  </div>
                </div>
              </div>

              {/* Code input */}
              <div className="mb-4">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code ({lineCount} lines)
                </label>
                <textarea
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code here..."
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                  style={{ fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, Courier New, monospace' }}
                />
              </div>

              {/* Preview */}
              {code.trim() && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                    <pre className={`language-${language}${showLineNumbers ? ' line-numbers' : ''} text-sm overflow-x-auto`}>
                      <code className={`language-${language}`}>
                        {code}
                      </code>
                    </pre>
                  </div>
                </div>
              )}

              {/* Code snippets */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quick Insert
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCode('function hello() {\n  console.log("Hello, World!");\n}')}
                    className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    JS Function
                  </button>
                  <button
                    type="button"
                    onClick={() => setCode('const [state, setState] = useState(null);')}
                    className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    React Hook
                  </button>
                  <button
                    type="button"
                    onClick={() => setCode('def hello_world():\n    print("Hello, World!")')}
                    className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Python Func
                  </button>
                  <button
                    type="button"
                    onClick={() => setCode('SELECT * FROM users WHERE active = 1;')}
                    className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    SQL Query
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={!code.trim()}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert Code Block
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodeBlockEditor;
