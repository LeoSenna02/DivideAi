// Componente para o card de tarefas de uma pessoa

import { useState } from 'react';
import { TaskCheckbox } from './Checkbox';
import { SkipTaskModal } from './SkipTaskModal';
import { TaskSwapRequestModal } from './TaskSwapRequestModal';
import type { DailyAssignment, HomeMember, TaskSwapRequest } from '../types';

interface TasksByPerson {
  userId: string;
  name: string;
  avatar?: string;
  initials: string;
  completed: number;
  total: number;
  currentScore: number;
  assignments: DailyAssignment[];
}

interface TaskCardProps {
  person: TasksByPerson;
  otherMembers: HomeMember[];
  onTaskToggle: (assignmentId: string) => void;
  onSkipTask: (assignmentId: string) => Promise<void>;
  onSwapTask?: (assignment: DailyAssignment) => void;
  pendingSwapRequests?: TaskSwapRequest[];
  onAcceptSwap?: (requestId: string) => Promise<void>;
  onDeclineSwap?: (requestId: string) => Promise<void>;
  currentUserId?: string;
}

export function TaskCard({ person, otherMembers, onTaskToggle, onSkipTask, onSwapTask, pendingSwapRequests = [], onAcceptSwap, onDeclineSwap, currentUserId }: TaskCardProps) {
  const [selectedAssignment, setSelectedAssignment] = useState<DailyAssignment | null>(null);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);
  const [selectedSwapRequest, setSelectedSwapRequest] = useState<TaskSwapRequest | null>(null);
  const [isSwapRequestModalOpen, setIsSwapRequestModalOpen] = useState(false);
  const [swapActionLoading, setSwapActionLoading] = useState(false);

  const handleSkipClick = (assignment: DailyAssignment) => {
    setSelectedAssignment(assignment);
    setIsSkipModalOpen(true);
  };

  const handleSkipConfirm = async () => {
    if (selectedAssignment) {
      await onSkipTask(selectedAssignment.id);
      setIsSkipModalOpen(false);
      setSelectedAssignment(null);
    }
  };

  const handleSkipCancel = () => {
    setIsSkipModalOpen(false);
    setSelectedAssignment(null);
  };

  // Verificar se uma tarefa tem solicitação de troca pendente
  const getPendingSwapRequest = (assignmentId: string): TaskSwapRequest | undefined => {
    return pendingSwapRequests.find(request => request.requestedAssignmentId === assignmentId);
  };

  // Verificar se o usuário atual enviou uma solicitação para esta tarefa
  const getSentSwapRequest = (assignmentId: string): TaskSwapRequest | undefined => {
    return pendingSwapRequests.find(request => request.offeredAssignmentId === assignmentId && request.requestedByUserId === currentUserId);
  };

  // Manipular clique na tarefa (para solicitações pendentes)
  const handleTaskClick = (assignment: DailyAssignment) => {
    const pendingRequest = getPendingSwapRequest(assignment.id);
    if (pendingRequest) {
      setSelectedSwapRequest(pendingRequest);
      setIsSwapRequestModalOpen(true);
    }
  };

  // Aceitar solicitação de troca
  const handleAcceptSwap = async (requestId: string) => {
    if (!onAcceptSwap) return;
    try {
      setSwapActionLoading(true);
      await onAcceptSwap(requestId);
      setIsSwapRequestModalOpen(false);
      setSelectedSwapRequest(null);
    } catch (error) {
      console.error('Erro ao aceitar troca:', error);
    } finally {
      setSwapActionLoading(false);
    }
  };

  // Recusar solicitação de troca
  const handleDeclineSwap = async (requestId: string) => {
    if (!onDeclineSwap) return;
    try {
      setSwapActionLoading(true);
      await onDeclineSwap(requestId);
      setIsSwapRequestModalOpen(false);
      setSelectedSwapRequest(null);
    } catch (error) {
      console.error('Erro ao recusar troca:', error);
    } finally {
      setSwapActionLoading(false);
    }
  };

  return (
    <div className="bg-neutral-white dark:bg-secondary-800 rounded-lg overflow-hidden shadow-sm border border-secondary-200 dark:border-secondary-700">
      {/* Header da Pessoa */}
      <div className="bg-primary-50 dark:bg-primary-900 px-4 py-3 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-600">{person.initials}</span>
            </div>
            <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">{person.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {person.completed}/{person.total} concluídas
            </p>
            <p className="text-sm font-bold text-primary-600 dark:text-primary-400">
              {Math.round(person.currentScore)} pts
            </p>
          </div>
        </div>
        {/* Barra de Progresso Horizontal */}
        <div className="w-full h-1 bg-secondary-200 dark:bg-secondary-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${(person.completed / person.total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Tarefas da Pessoa */}
      <div className="divide-y divide-secondary-100 dark:divide-secondary-700 max-h-48 overflow-y-auto scroll-elegant">
        {person.assignments
          .sort((a, b) => {
            // Tarefas não completadas primeiro (false vem antes de true)
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            // Se ambas têm o mesmo status, manter a ordem original
            return 0;
          })
          .map((assignment) => {
          const pendingRequest = getPendingSwapRequest(assignment.id);
          const sentRequest = getSentSwapRequest(assignment.id);
          const hasPendingSwap = !!pendingRequest;
          const hasSentSwap = !!sentRequest;

          return (
            <div
              key={assignment.id}
              className={`px-4 py-3 flex items-center space-x-3 hover:bg-secondary-25 dark:hover:bg-secondary-700 cursor-pointer transition-colors ${
                hasPendingSwap ? 'border-l-4 border-b-4 border-warning-200 dark:border-warning-600' : ''
              }`}
              onClick={() => handleTaskClick(assignment)}
            >
              <TaskCheckbox
                checked={assignment.completed}
                onChange={() => onTaskToggle(assignment.id)}
              />
              <div className="flex-1">
                <span
                  className={`block ${
                    assignment.completed
                      ? 'line-through text-secondary-400 dark:text-secondary-500'
                      : 'text-secondary-900 dark:text-secondary-100'
                  }`}
                >
                  {assignment.taskTitle}
                </span>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-secondary-500 dark:text-secondary-400">
                    Peso: {assignment.taskWeight}/5
                  </span>
                  {hasPendingSwap && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-warning-50 text-warning-600 dark:bg-warning-700 dark:text-warning-50 border border-warning-100 dark:border-warning-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0h4m10 0v12m0 0l4-4m0 0h-4" />
                      </svg>
                      Troca pendente
                    </span>
                  )}
                  {hasSentSwap && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-info-50 text-info-600 dark:bg-info-700 dark:text-info-50 border border-info-100 dark:border-info-600">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Solicitado
                    </span>
                  )}
                  {assignment.swapped && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-800 text-success-800 dark:text-success-200">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0h4m10 0v12m0 0l4-4m0 0h-4" />
                      </svg>
                      Trocado
                    </span>
                  )}
                </div>
              </div>
              {/* Ícones de Pular e Trocar */}
              <div className="flex items-center space-x-2">
                {currentUserId === person.userId && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSkipClick(assignment);
                    }}
                    className="p-1 text-secondary-400 dark:text-secondary-500 hover:text-warning-600 dark:hover:text-warning-400 transition-colors"
                    title="Pular tarefa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                {currentUserId === person.userId && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSwapTask?.(assignment);
                    }}
                    className="p-1 text-secondary-400 dark:text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title="Propor troca"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0h4m10 0v12m0 0l4-4m0 0h-4" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Pular Tarefa */}
      <SkipTaskModal
        isOpen={isSkipModalOpen}
        assignment={selectedAssignment}
        otherMembers={otherMembers}
        onConfirm={handleSkipConfirm}
        onCancel={handleSkipCancel}
      />

      {/* Modal de Solicitação de Troca */}
      <TaskSwapRequestModal
        isOpen={isSwapRequestModalOpen}
        onClose={() => {
          setIsSwapRequestModalOpen(false);
          setSelectedSwapRequest(null);
        }}
        swapRequest={selectedSwapRequest}
        onAccept={handleAcceptSwap}
        onDecline={handleDeclineSwap}
        loading={swapActionLoading}
        currentUserId={currentUserId}
      />
    </div>
  );
}