import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  closeOnOutsideClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'max-w-md',
  closeOnOutsideClick = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Controla o scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      // Salva o scroll atual
      const scrollY = window.scrollY;
      // Previne scroll do body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      // Restaura quando modal fecha
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Handler para click outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`bg-white dark:bg-secondary-800 rounded-xl shadow-xl ${maxWidth} w-full animate-in`}
        onClick={(e) => e.stopPropagation()} // Previne que clicks dentro do modal fechem ele
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-primary-700 p-1 rounded transition-colors"
            aria-label="Fechar"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="bg-secondary-50 dark:bg-secondary-800 px-6 py-4 border-t border-secondary-200 dark:border-secondary-700 flex gap-3 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
