// Componente Select personalizado - Design System DivideAí

import { forwardRef, useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    options,
    placeholder = "Selecione uma opção",
    error,
    helperText,
    size = 'md',
    fullWidth = false,
    className = '',
    value,
    onChange,
    ...props
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedLabel, setSelectedLabel] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);

    // Atualizar o label selecionado quando o value muda
    useEffect(() => {
      const selectedOption = options.find(option => option.value === value);
      setSelectedLabel(selectedOption?.label || '');
    }, [value, options]);

    // Fechar dropdown quando clicar fora
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectClick = () => {
      setIsOpen(!isOpen);
    };

    const handleOptionClick = (option: SelectOption) => {
      if (option.disabled) return;

      // Simular o evento onChange
      const syntheticEvent = {
        target: { value: option.value, name: props.name }
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange?.(syntheticEvent);
      setIsOpen(false);
    };

    const sizeClasses = {
      sm: 'select-sm',
      md: '',
      lg: 'select-lg'
    };

    const displayValue = selectedLabel || placeholder;
    const hasSelection = selectedLabel !== '';

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="label">
            {label}
          </label>
        )}

        <div className="relative" ref={containerRef}>
          {/* Select invisível para manter compatibilidade com formulários */}
          <select
            ref={(el) => {
              if (ref) {
                if (typeof ref === 'function') {
                  ref(el);
                } else {
                  ref.current = el;
                }
              }
              selectRef.current = el;
            }}
            className="sr-only"
            value={value}
            onChange={onChange}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Display customizado */}
          <div
            className={`
              select-custom
              ${sizeClasses[size]}
              ${error ? 'border-danger-300 focus:ring-danger-500 focus:border-danger-500' : ''}
              ${fullWidth ? 'w-full' : ''}
              ${isOpen ? 'ring-2 ring-primary-500 border-primary-500' : ''}
              ${className}
            `.trim().replace(/\s+/g, ' ')}
            onClick={handleSelectClick}
          >
            <span className={`${hasSelection ? 'text-secondary-900' : 'text-secondary-400'}`}>
              {displayValue}
            </span>
            <FiChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>

          {/* Dropdown customizado */}
          {isOpen && (
            <div className="select-dropdown">
              {options.map((option) => (
                <div
                  key={option.value}
                  className={`
                    select-option
                    ${option.disabled ? 'select-option-disabled' : 'select-option-enabled'}
                    ${value === option.value ? 'select-option-selected' : ''}
                  `}
                  onClick={() => handleOptionClick(option)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-danger-600">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';