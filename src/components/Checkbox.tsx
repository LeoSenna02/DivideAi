// Componente Checkbox personalizado para o DivideAí
// Design consistente com o app, usando cores e estilos do design system

import { forwardRef } from 'react';
import { LuCheck } from 'react-icons/lu';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, helperText, size = 'md', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className={`flex flex-col ${className}`}>
        <label className="flex items-center space-x-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              ref={ref}
              className="sr-only" // Esconde o checkbox nativo
              {...props}
            />

            {/* Checkbox customizado */}
            <div
              className={`
                ${sizeClasses[size]}
                border-2 rounded-md transition-all duration-200 ease-in-out
                flex items-center justify-center
                ${
                  props.checked
                    ? 'bg-primary-500 border-primary-500 text-white shadow-sm'
                    : 'bg-neutral-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700 group-hover:border-primary-400 dark:group-hover:border-primary-500'
                }
                ${
                  props.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer group-hover:shadow-sm'
                }
                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              `}
            >
              {/* Ícone de check */}
              {props.checked && (
                <LuCheck
                  className={`${iconSizeClasses[size]} transition-transform duration-200 ${
                    props.checked ? 'scale-100' : 'scale-0'
                  }`}
                />
              )}
            </div>
          </div>

          {/* Label opcional */}
            {label && (
            <span
              className={`
                select-none transition-colors duration-200
                ${
                  props.disabled
                    ? 'text-secondary-400 cursor-not-allowed dark:text-secondary-500'
                    : props.checked
                      ? 'text-secondary-900 dark:text-secondary-100'
                      : 'text-secondary-700 group-hover:text-secondary-900 dark:text-secondary-200 dark:group-hover:text-secondary-100'
                }
                ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}
              `}
            >
              {label}
            </span>
          )}
        </label>

        {/* Texto auxiliar */}
        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400 ml-8">{helperText}</p>
        )}

        {/* Mensagem de erro */}
        {error && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400 ml-8">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

// ============ VARIANTE ESPECÍFICA PARA TAREFAS ============

interface TaskCheckboxProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TaskCheckbox = ({ checked, onChange, disabled = false, size = 'md' }: TaskCheckboxProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only" // Esconde o checkbox nativo
      />

      {/* Checkbox customizado para tarefas */}
      <div
        onClick={!disabled ? onChange : undefined}
        className={`
          ${sizeClasses[size]}
          border-2 rounded-md transition-all duration-200 ease-in-out
          flex items-center justify-center cursor-pointer
          ${
            checked
              ? 'bg-success-500 border-success-500 text-white shadow-sm'
              : 'bg-neutral-white dark:bg-secondary-800 border-secondary-300 dark:border-secondary-700 hover:border-success-400 dark:hover:border-success-400 hover:shadow-sm'
          }
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }
          focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2
          active:scale-95 transform
        `}
      >
        {/* Ícone de check animado */}
        <LuCheck
          className={`${iconSizeClasses[size]} transition-all duration-200 ${
            checked ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
        />
      </div>
    </div>
  );
};
