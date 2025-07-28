import React, { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = React.memo(({
  label,
  htmlFor,
  required = false,
  error,
  hint,
  children,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label 
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {children}
      
      {hint && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      )}
      
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

// Add display name for debugging
FormField.displayName = 'FormField';

export default FormField;
