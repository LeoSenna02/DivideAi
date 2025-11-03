// Modal para pular tarefas com penalidade e oferta para outros

import { useState } from 'react';
import { FiX, FiAlertCircle, FiCheck } from 'react-icons/fi';
import type { DailyAssignment, HomeMember } from '../types';

interface SkipTaskModalProps {
  isOpen: boolean;
  assignment: DailyAssignment | null;
  otherMembers: HomeMember[];
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function SkipTaskModal({
  isOpen,
  assignment,
  otherMembers,
  onConfirm,
  onCancel,
}: SkipTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const SKIP_PENALTY = 10;
  const BONUS_POINTS = 5;

  if (!isOpen || !assignment) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onConfirm();
      // Modal será fechada automaticamente após sucesso
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao pular tarefa';
      setError(errorMessage);
      console.error('Erro ao pular tarefa:', err);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-warning-50 px-4 sm:px-6 py-4 border-b border-warning-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning-100 rounded-full">
              <FiAlertCircle className="w-5 h-5 text-warning-600" />
            </div>
            <h3 className="text-lg font-bold text-secondary-900">Pular Tarefa</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-secondary-600 hover:text-secondary-900 p-1"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* Detalhes da Tarefa */}
          <div className="bg-secondary-50 rounded-lg p-4 border border-secondary-200">
            <h4 className="font-semibold text-secondary-900 mb-2">{assignment.taskTitle}</h4>
            <div className="space-y-1 text-sm text-secondary-600">
              <p>
                <span className="font-medium">Peso:</span> {assignment.taskWeight}/5
              </p>
              <p>
                <span className="font-medium">Responsável:</span> {assignment.assignedToName}
              </p>
            </div>
          </div>

          {/* Aviso de Penalidade */}
          <div className="bg-danger-50 rounded-lg p-4 border border-danger-200">
            <h5 className="font-semibold text-danger-700 mb-2 flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4" />
              Penalidade por Pular
            </h5>
            <p className="text-sm text-danger-600">
              Você perderá <span className="font-bold">{SKIP_PENALTY} pontos</span> por pular esta tarefa.
            </p>
          </div>

          {/* Oferta para Outros */}
          <div>
            <h5 className="font-semibold text-secondary-900 mb-3">
              Oferecer para Outros com Bônus
            </h5>
            <p className="text-sm text-secondary-600 mb-3">
              A tarefa será oferecida para os outros membros. Eles ganharão <span className="font-bold">{BONUS_POINTS} pontos extras</span> se aceitarem.
            </p>

            {otherMembers.length > 0 ? (
              <div className="space-y-2">
                {otherMembers.map(member => (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary-600">
                        {(member.userName || 'U')
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-secondary-900">
                      {member.userName}
                    </span>
                    <FiCheck className="w-4 h-4 text-success-600 ml-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary-500 p-3 bg-secondary-50 rounded-lg">
                Nenhum outro membro disponível
              </p>
            )}
          </div>

          {/* Informação sobre sorteio */}
          <div className="bg-info-50 rounded-lg p-3 border border-info-200">
            <p className="text-xs text-info-700">
              Se ninguém aceitar até o final do dia, a tarefa voltará ao sorteio para amanhã.
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="bg-danger-50 rounded-lg p-3 border border-danger-200">
              <p className="text-xs text-danger-700">
                <span className="font-bold">❌ Erro:</span> {error}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-secondary-50 px-4 sm:px-6 py-4 border-t border-secondary-200 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-secondary-300 rounded-lg text-secondary-700 font-medium hover:bg-secondary-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-warning-600 hover:bg-warning-700 disabled:bg-warning-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              <>
                <FiAlertCircle className="w-4 h-4" />
                Sim, Pular Tarefa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
