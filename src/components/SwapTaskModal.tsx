import { useState } from 'react';
import { Modal } from './Modal';
import { Select } from './Select';
import type { DailyAssignment, HomeMember, TaskSwapRequest } from '../types';

interface SwapTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  myAssignment: DailyAssignment | null;
  otherMembers: HomeMember[];
  allAssignments: DailyAssignment[];
  onConfirm: (swapRequest: Omit<TaskSwapRequest, 'id' | 'createdAt'>) => Promise<void>;
  loading?: boolean;
}

export function SwapTaskModal({
  isOpen,
  onClose,
  myAssignment,
  otherMembers,
  allAssignments,
  onConfirm,
  loading = false,
}: SwapTaskModalProps) {
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [selectedMemberAssignment, setSelectedMemberAssignment] = useState<string>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Buscar tarefas do membro selecionado
  const getMemberAssignments = (): DailyAssignment[] => {
    if (!selectedMember) return [];
    // Filtrar apenas as tarefas do membro selecionado que não estejam completadas e não sejam a tarefa atual do usuário
    return allAssignments.filter(assignment =>
      assignment.assignedToId === selectedMember &&
      !assignment.completed &&
      assignment.id !== myAssignment?.id // Não permitir trocar com a própria tarefa
    );
  };

  const handleConfirm = async () => {
    if (!myAssignment || !selectedMember || !selectedMemberAssignment) {
      setError('Por favor, selecione um membro e uma tarefa para trocar');
      return;
    }

    const selectedMemberData = otherMembers.find(m => m.userId === selectedMember);
    if (!selectedMemberData) {
      setError('Membro não encontrado');
      return;
    }

    // Buscar os dados da tarefa selecionada
    const requestedAssignment = allAssignments.find(a => a.id === selectedMemberAssignment);
    if (!requestedAssignment) {
      setError('Tarefa selecionada não encontrada');
      return;
    }

    try {
      setError(null);
      
      // Criar o objeto base da solicitação
      const baseSwapRequest = {
        homeId: myAssignment.homeId,
        dateKey: myAssignment.dateKey,
        requestedByUserId: '', // Será preenchido pela página
        requestedByName: '', // Será preenchido pela página
        requestedToUserId: selectedMember,
        requestedToName: selectedMemberData.userName || 'Usuário',
        offeredTaskId: myAssignment.taskId,
        offeredTaskTitle: myAssignment.taskTitle,
        offeredTaskWeight: myAssignment.taskWeight,
        offeredAssignmentId: myAssignment.id,
        requestedTaskId: requestedAssignment.taskId,
        requestedTaskTitle: requestedAssignment.taskTitle,
        requestedTaskWeight: requestedAssignment.taskWeight,
        requestedAssignmentId: selectedMemberAssignment,
        status: 'pending' as const,
      };

      // Adicionar mensagem apenas se não estiver vazia
      const swapRequest = message.trim() 
        ? { ...baseSwapRequest, message: message.trim() }
        : baseSwapRequest;

      await onConfirm(swapRequest);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar pedido de troca');
    }
  };

  const handleClose = () => {
    setSelectedMember('');
    setSelectedMemberAssignment('');
    setMessage('');
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Propor Troca de Tarefa"
      maxWidth="max-w-md"
      footer={
        <>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 disabled:bg-secondary-100 dark:disabled:bg-secondary-800 text-secondary-700 dark:text-secondary-200 disabled:text-secondary-400 dark:disabled:text-secondary-500 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !selectedMember || !selectedMemberAssignment}
            className="flex-1 bg-primary-500 dark:bg-primary-600 hover:bg-primary-600 dark:hover:bg-primary-700 disabled:bg-primary-300 dark:disabled:bg-primary-400 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center text-sm"
          >
            {loading ? (
              <>
                <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                Enviando...
              </>
            ) : (
              <>
                Propor Troca
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Tarefa a oferecer */}
        {myAssignment && (
          <div className="bg-primary-50 dark:bg-primary-900 p-3 rounded-lg border border-primary-200 dark:border-primary-700">
            <p className="text-xs text-secondary-600 dark:text-secondary-400 font-medium mb-1">Você oferece:</p>
            <p className="font-medium text-secondary-900 dark:text-secondary-100">{myAssignment.taskTitle}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">Peso: {myAssignment.taskWeight}/5</p>
          </div>
        )}

        {/* Seleção de membro */}
        <div>
          <Select
            label="Para quem?"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            placeholder="Selecione um membro"
            options={otherMembers.map(m => ({
              value: m.userId,
              label: m.userName || 'Usuário'
            }))}
            fullWidth
          />
        </div>

        {/* Seleção de tarefa do outro membro */}
        {selectedMember && (
          <div>
            <Select
              label="Você recebe:"
              value={selectedMemberAssignment}
              onChange={(e) => setSelectedMemberAssignment(e.target.value)}
              placeholder="Selecione uma tarefa"
              options={getMemberAssignments().map(a => ({
                value: a.id,
                label: `${a.taskTitle} (Peso: ${a.taskWeight}/5)`
              }))}
              disabled={getMemberAssignments().length === 0}
              fullWidth
            />
            {getMemberAssignments().length === 0 && (
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-2">Este membro não tem tarefas disponíveis para hoje.</p>
            )}
          </div>
        )}

        {/* Mensagem opcional */}
        <div>
          <label className="label">Mensagem (opcional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: Eu tenho compromisso cedo amanhã..."
            maxLength={200}
            className="input w-full resize-none h-20"
          />
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">{message.length}/200 caracteres</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="p-3 bg-danger-50 dark:bg-danger-900 border border-danger-200 dark:border-danger-700 rounded-lg">
            <p className="text-xs text-danger-700 dark:text-danger-300">{error}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
