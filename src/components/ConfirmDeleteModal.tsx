import { Modal } from './Modal';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar Exclusão',
  message,
  confirmText = 'Excluir',
  cancelText = 'Cancelar',
  loading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-secondary-100 hover:bg-secondary-200 disabled:bg-secondary-100 text-secondary-700 disabled:text-secondary-400 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-danger-500 hover:bg-danger-600 disabled:bg-danger-300 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Excluindo...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {confirmText}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-danger-100 mb-4">
          <svg className="h-6 w-6 text-danger-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-sm text-secondary-600">{message}</p>
      </div>
    </Modal>
  );
}