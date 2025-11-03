// Componente para exibir e gerenciar tarefas oferecidas

import { useState } from 'react';
import { FiCheck, FiX, FiGift } from 'react-icons/fi';
import type { OfferedTask } from '../types';

interface OfferedTasksProps {
  tasks: OfferedTask[];
  onAccept: (offeredTaskId: string) => Promise<void>;
  onDecline: (offeredTaskId: string) => Promise<void>;
}

export function OfferedTasksList({ tasks, onAccept, onDecline }: OfferedTasksProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAccept = async (offeredTaskId: string) => {
    try {
      setLoadingId(offeredTaskId);
      await onAccept(offeredTaskId);
    } catch (error) {
      console.error('Erro ao aceitar tarefa:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDecline = async (offeredTaskId: string) => {
    try {
      setLoadingId(offeredTaskId);
      await onDecline(offeredTaskId);
    } catch (error) {
      console.error('Erro ao recusar tarefa:', error);
    } finally {
      setLoadingId(null);
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <FiGift className="w-5 h-5 text-primary-600" />
        <h4 className="font-semibold text-primary-900">Tarefas Oferecidas</h4>
      </div>

      <div className="space-y-2">
        {tasks.map(task => (
          <div
            key={task.id}
            className="bg-white rounded-lg p-3 border border-primary-100 flex items-center justify-between"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-secondary-900">
                {task.taskTitle}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-secondary-600">
                <span>Peso: {task.taskWeight}/5</span>
                <span>•</span>
                <span className="text-success-600 font-medium">+{task.bonusPoints} pts</span>
              </div>
              <p className="text-xs text-secondary-500 mt-1">
                Oferecida por: {task.offeredToName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAccept(task.id)}
                disabled={loadingId === task.id}
                className="p-2 bg-success-100 hover:bg-success-200 text-success-600 rounded-lg transition-colors disabled:opacity-50"
                title="Aceitar tarefa"
              >
                {loadingId === task.id ? (
                  <div className="animate-spin w-4 h-4 border-2 border-success-600 border-t-transparent rounded-full" />
                ) : (
                  <FiCheck className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleDecline(task.id)}
                disabled={loadingId === task.id}
                className="p-2 bg-danger-100 hover:bg-danger-200 text-danger-600 rounded-lg transition-colors disabled:opacity-50"
                title="Recusar tarefa"
              >
                {loadingId === task.id ? (
                  <div className="animate-spin w-4 h-4 border-2 border-danger-600 border-t-transparent rounded-full" />
                ) : (
                  <FiX className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
