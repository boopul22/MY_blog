import React, { useState } from 'react';

interface TableManagerProps {
  onInsertTable: (tableHtml: string) => void;
  onClose: () => void;
}

interface TableConfig {
  rows: number;
  columns: number;
  hasHeader: boolean;
  hasFooter: boolean;
  striped: boolean;
  bordered: boolean;
  responsive: boolean;
  alignment: 'left' | 'center' | 'right';
  width: string;
}

const TableManager: React.FC<TableManagerProps> = ({ onInsertTable, onClose }) => {
  const [config, setConfig] = useState<TableConfig>({
    rows: 3,
    columns: 3,
    hasHeader: true,
    hasFooter: false,
    striped: false,
    bordered: true,
    responsive: true,
    alignment: 'left',
    width: '100%',
  });

  const generateTableHtml = (): string => {
    const { rows, columns, hasHeader, hasFooter, striped, bordered, responsive, alignment, width } = config;
    
    let tableClasses = ['table'];
    if (striped) tableClasses.push('table-striped');
    if (bordered) tableClasses.push('table-bordered');
    if (responsive) tableClasses.push('table-responsive');
    
    let tableStyle = `width: ${width}; text-align: ${alignment};`;
    if (bordered) {
      tableStyle += ' border-collapse: collapse;';
    }
    
    let html = `<table class="${tableClasses.join(' ')}" style="${tableStyle}">`;
    
    // Generate header
    if (hasHeader) {
      html += '<thead><tr>';
      for (let col = 0; col < columns; col++) {
        html += `<th style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f8f9fa; font-weight: 600;">Header ${col + 1}</th>`;
      }
      html += '</tr></thead>';
    }
    
    // Generate body
    html += '<tbody>';
    const bodyRows = hasHeader ? rows - 1 : rows;
    const startRow = hasFooter ? 0 : 0;
    const endRow = hasFooter ? bodyRows - 1 : bodyRows;
    
    for (let row = startRow; row < endRow; row++) {
      html += '<tr>';
      for (let col = 0; col < columns; col++) {
        html += `<td style="padding: 12px; border: 1px solid #e2e8f0;">Cell ${row + 1}-${col + 1}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';
    
    // Generate footer
    if (hasFooter) {
      html += '<tfoot><tr>';
      for (let col = 0; col < columns; col++) {
        html += `<td style="padding: 12px; border: 1px solid #e2e8f0; background-color: #f8f9fa; font-weight: 600;">Footer ${col + 1}</td>`;
      }
      html += '</tr></tfoot>';
    }
    
    html += '</table>';
    
    // Wrap in responsive container if needed
    if (responsive) {
      html = `<div class="table-responsive" style="overflow-x: auto;">${html}</div>`;
    }
    
    return html;
  };

  const handleInsert = () => {
    const tableHtml = generateTableHtml();
    onInsertTable(tableHtml);
    onClose();
  };

  const previewHtml = generateTableHtml();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Table Manager</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Configuration Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuration</h3>
              
              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rows
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.rows}
                    onChange={(e) => setConfig(prev => ({ ...prev, rows: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Columns
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={config.columns}
                    onChange={(e) => setConfig(prev => ({ ...prev, columns: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Table Features */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.hasHeader}
                    onChange={(e) => setConfig(prev => ({ ...prev, hasHeader: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Header Row</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.hasFooter}
                    onChange={(e) => setConfig(prev => ({ ...prev, hasFooter: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Include Footer Row</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.striped}
                    onChange={(e) => setConfig(prev => ({ ...prev, striped: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Striped Rows</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.bordered}
                    onChange={(e) => setConfig(prev => ({ ...prev, bordered: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bordered</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.responsive}
                    onChange={(e) => setConfig(prev => ({ ...prev, responsive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Responsive</span>
                </label>
              </div>

              {/* Alignment and Width */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Text Alignment
                  </label>
                  <select
                    value={config.alignment}
                    onChange={(e) => setConfig(prev => ({ ...prev, alignment: e.target.value as 'left' | 'center' | 'right' }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Table Width
                  </label>
                  <select
                    value={config.width}
                    onChange={(e) => setConfig(prev => ({ ...prev, width: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="100%">Full Width (100%)</option>
                    <option value="75%">Three Quarters (75%)</option>
                    <option value="50%">Half Width (50%)</option>
                    <option value="25%">Quarter Width (25%)</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preview</h3>
              <div 
                className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-gray-50 dark:bg-gray-700 overflow-auto"
                style={{ maxHeight: '400px' }}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Insert Table
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableManager;
