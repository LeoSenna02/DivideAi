import { Modal } from './Modal';
import type { TaskSwapRequest } from '../types';
import { FiCheck, FiX } from 'react-icons/fi';

interface TaskSwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapRequest: TaskSwapRequest | null;
  onAccept: (swapRequestId: string) => Promise<void>;
  onDecline: (swapRequestId: string) => Promise<void>;
  loading?: boolean;
}

export function TaskSwapRequestModal({
  isOpen,
  onClose,
  swapRequest,
  onAccept,
  onDecline,
  loading = false,
}: TaskSwapRequestModalProps) {
  if (!swapRequest) return null;

  const handleAccept = async () => {
    await onAccept(swapRequest.id);
    onClose();
  };

  const handleDecline = async () => {
    await onDecline(swapRequest.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pedido de Troca de Tarefa"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            onClick={handleDecline}
            disabled={loading}
            className="flex-1 bg-danger-100 hover:bg-danger-200 disabled:bg-danger-100 text-danger-700 disabled:text-danger-400 font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
          >
            <FiX className="w-3 h-3" />
            Recusar
          </button>
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 bg-success-500 hover:bg-success-600 disabled:bg-success-300 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
          >
            {loading ? (
              <>
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Processando...
              </>
            ) : (
              <>
                <FiCheck className="w-3 h-3" />
                Aceitar
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* De quem é o pedido */}
        <div>
          <p className="text-xs text-secondary-600 font-medium mb-1">De:</p>
          <p className="font-medium text-secondary-900">{swapRequest.requestedByName}</p>
        </div>

        {/* Tarefa oferecida */}
        <div className="bg-primary-50 p-3 rounded-lg border border-primary-200">
          <p className="text-xs text-secondary-600 font-medium mb-1">Oferece:</p>
          <p className="font-medium text-secondary-900">{swapRequest.offeredTaskTitle}</p>
          <p className="text-xs text-secondary-500">Peso: {swapRequest.offeredTaskWeight}/5</p>
        </div>

        {/* Tarefa solicitada */}
        <div className="bg-success-50 p-3 rounded-lg border border-success-200">
          <p className="text-xs text-secondary-600 font-medium mb-1">Quer receber:</p>
          <p className="font-medium text-secondary-900">{swapRequest.requestedTaskTitle}</p>
          <p className="text-xs text-secondary-500">Peso: {swapRequest.requestedTaskWeight}/5</p>
        </div>

        {/* Seta visual */}
        <div className="flex items-center justify-center text-secondary-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0h4m10 0v12m0 0l4-4m0 0h-4" />
          </svg>
        </div>

        {/* Mensagem (se houver) */}
        {swapRequest.message && (
          <div className="bg-secondary-50 p-3 rounded-lg border border-secondary-200">
            <p className="text-xs text-secondary-600 font-medium mb-1">Mensagem:</p>
            <p className="text-sm text-secondary-700 italic">"{swapRequest.message}"</p>
          </div>
        )}

        {/* Data */}
        <div className="text-xs text-secondary-500 text-center pt-2 border-t border-secondary-100">
          Solicitado em {new Date(swapRequest.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>
    </Modal>
  );
}
