import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from './icons';

interface TableEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (tableHtml: string) => void;
  initialTable?: {
    rows: string[][];
    headers: boolean;
    caption?: string;
  };
}

interface TableStyle {
  borderStyle: 'none' | 'solid' | 'dashed' | 'dotted';
  borderWidth: '1' | '2' | '3';
  borderColor: string;
  backgroundColor: string;
  headerBackground: string;
  alternateRows: boolean;
  responsive: boolean;
}

const TableEditor: React.FC<TableEditorProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialTable
}) => {
  const [rows, setRows] = useState<string[][]>([
    ['Header 1', 'Header 2', 'Header 3'],
    ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
    ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
  ]);
  const [hasHeaders, setHasHeaders] = useState(true);
  const [caption, setCaption] = useState('');
  const [tableStyle, setTableStyle] = useState<TableStyle>({
    borderStyle: 'solid',
    borderWidth: '1',
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    headerBackground: '#f3f4f6',
    alternateRows: true,
    responsive: true
  });

  // Initialize table from props
  useEffect(() => {
    if (isOpen && initialTable) {
      setRows(initialTable.rows);
      setHasHeaders(initialTable.headers);
      setCaption(initialTable.caption || '');
    }
  }, [isOpen, initialTable]);

  // Add row
  const addRow = () => {
    const newRow = new Array(rows[0]?.length || 3).fill('');
    setRows([...rows, newRow]);
  };

  // Add column
  const addColumn = () => {
    setRows(rows.map(row => [...row, '']));
  };

  // Remove row
  const removeRow = (index: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  // Remove column
  const removeColumn = (index: number) => {
    if (rows[0]?.length > 1) {
      setRows(rows.map(row => row.filter((_, i) => i !== index)));
    }
  };

  // Update cell value
  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
  };

  // Generate table HTML
  const generateTableHtml = () => {
    const styles = {
      table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        border: `${tableStyle.borderWidth}px ${tableStyle.borderStyle} ${tableStyle.borderColor}`,
        backgroundColor: tableStyle.backgroundColor,
        ...(tableStyle.responsive && { overflowX: 'auto' as const })
      },
      th: {
        border: `${tableStyle.borderWidth}px ${tableStyle.borderStyle} ${tableStyle.borderColor}`,
        padding: '12px',
        textAlign: 'left' as const,
        backgroundColor: tableStyle.headerBackground,
        fontWeight: 'bold' as const
      },
      td: {
        border: `${tableStyle.borderWidth}px ${tableStyle.borderStyle} ${tableStyle.borderColor}`,
        padding: '12px',
        textAlign: 'left' as const
      }
    };

    const styleToString = (styleObj: any) => {
      return Object.entries(styleObj)
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');
    };

    let html = '';
    
    if (tableStyle.responsive) {
      html += '<div style="overflow-x: auto;">';
    }
    
    html += `<table style="${styleToString(styles.table)}">`;
    
    if (caption) {
      html += `<caption style="caption-side: top; text-align: center; font-weight: bold; margin-bottom: 8px;">${caption}</caption>`;
    }

    rows.forEach((row, rowIndex) => {
      const isHeader = hasHeaders && rowIndex === 0;
      const isAlternateRow = tableStyle.alternateRows && !isHeader && rowIndex % 2 === 0;
      
      html += '<tr>';
      
      row.forEach((cell, colIndex) => {
        const tag = isHeader ? 'th' : 'td';
        const cellStyle = isHeader ? styles.th : {
          ...styles.td,
          ...(isAlternateRow && { backgroundColor: '#f9fafb' })
        };
        
        html += `<${tag} style="${styleToString(cellStyle)}">${cell || '&nbsp;'}</${tag}>`;
      });
      
      html += '</tr>';
    });

    html += '</table>';
    
    if (tableStyle.responsive) {
      html += '</div>';
    }

    return html;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tableHtml = generateTableHtml();
    onInsert(tableHtml);
    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
    setRows([
      ['Header 1', 'Header 2', 'Header 3'],
      ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
      ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3']
    ]);
    setHasHeaders(true);
    setCaption('');
    onClose();
  };

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
        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                  Table Editor
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
            <div className="bg-white dark:bg-gray-800 px-4 pb-4 sm:p-6 sm:pt-0 max-h-96 overflow-y-auto">
              {/* Table options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Table Caption (optional)
                  </label>
                  <input
                    type="text"
                    id="caption"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter table caption..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="has-headers"
                      type="checkbox"
                      checked={hasHeaders}
                      onChange={(e) => setHasHeaders(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="has-headers" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      First row as headers
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="alternate-rows"
                      type="checkbox"
                      checked={tableStyle.alternateRows}
                      onChange={(e) => setTableStyle(prev => ({ ...prev, alternateRows: e.target.checked }))}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="alternate-rows" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Alternate row colors
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="responsive"
                      type="checkbox"
                      checked={tableStyle.responsive}
                      onChange={(e) => setTableStyle(prev => ({ ...prev, responsive: e.target.checked }))}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                    <label htmlFor="responsive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Responsive table
                    </label>
                  </div>
                </div>
              </div>

              {/* Table controls */}
              <div className="flex items-center space-x-2 mb-4">
                <button
                  type="button"
                  onClick={addRow}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Row
                </button>
                <button
                  type="button"
                  onClick={addColumn}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Column
                </button>
              </div>

              {/* Table editor */}
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className={hasHeaders && rowIndex === 0 ? 'bg-gray-50 dark:bg-gray-700' : ''}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-gray-200 dark:border-gray-600 p-1">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                              className="w-full px-2 py-1 text-sm border-0 focus:ring-0 focus:outline-none bg-transparent dark:text-white"
                              placeholder={hasHeaders && rowIndex === 0 ? `Header ${colIndex + 1}` : `Cell ${rowIndex + 1}-${colIndex + 1}`}
                            />
                          </td>
                        ))}
                        <td className="border border-gray-200 dark:border-gray-600 p-1 w-10">
                          <button
                            type="button"
                            onClick={() => removeRow(rowIndex)}
                            disabled={rows.length <= 1}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      {rows[0]?.map((_, colIndex) => (
                        <td key={colIndex} className="border border-gray-200 dark:border-gray-600 p-1 text-center">
                          <button
                            type="button"
                            onClick={() => removeColumn(colIndex)}
                            disabled={rows[0]?.length <= 1}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      ))}
                      <td className="border border-gray-200 dark:border-gray-600 p-1"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Preview */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</h4>
                <div 
                  className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: generateTableHtml() }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Insert Table
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

export default TableEditor;
