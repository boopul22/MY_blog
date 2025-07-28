import React, { useState, KeyboardEvent } from 'react';

interface KeywordsInputProps {
  value: string;
  onChange: (keywords: string) => void;
  placeholder?: string;
  maxKeywords?: number;
  className?: string;
}

const KeywordsInput: React.FC<KeywordsInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter keywords and press Enter',
  maxKeywords = 10,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  
  // Parse keywords from comma-separated string
  const keywords = value ? value.split(',').map(k => k.trim()).filter(k => k.length > 0) : [];

  const addKeyword = (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword && !keywords.includes(trimmedKeyword) && keywords.length < maxKeywords) {
      const newKeywords = [...keywords, trimmedKeyword];
      onChange(newKeywords.join(', '));
      setInputValue('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter(k => k !== keywordToRemove);
    onChange(newKeywords.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(inputValue);
    } else if (e.key === 'Backspace' && inputValue === '' && keywords.length > 0) {
      // Remove last keyword if input is empty and backspace is pressed
      removeKeyword(keywords[keywords.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow comma-separated input
    if (value.includes(',')) {
      const newKeywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
      newKeywords.forEach(keyword => {
        if (!keywords.includes(keyword) && keywords.length < maxKeywords) {
          addKeyword(keyword);
        }
      });
      setInputValue('');
    } else {
      setInputValue(value);
    }
  };

  return (
    <div className={`keywords-input ${className}`}>
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        {keywords.map((keyword, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {keyword}
            <button
              type="button"
              onClick={() => removeKeyword(keyword)}
              className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 focus:outline-none"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={keywords.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] border-none outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          disabled={keywords.length >= maxKeywords}
        />
      </div>
      
      <div className="flex justify-between items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
        <div>
          {keywords.length > 0 && (
            <span>
              {keywords.length} of {maxKeywords} keywords
            </span>
          )}
        </div>
        <div className="text-xs">
          Press Enter or comma to add keywords
        </div>
      </div>
      
      {keywords.length >= maxKeywords && (
        <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
          Maximum number of keywords reached
        </div>
      )}
    </div>
  );
};

export default KeywordsInput;
