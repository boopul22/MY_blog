import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

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
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>

      {children}

      {hint && !error && (
        <p className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

// Add display name for debugging
FormField.displayName = 'FormField';

export default FormField;
