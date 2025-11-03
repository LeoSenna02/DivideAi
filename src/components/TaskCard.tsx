// Componente para o card de tarefas de uma pessoa

import { useState } from 'react';
import { TaskCheckbox } from './Checkbox';
import { SkipTaskModal } from './SkipTaskModal';
import type { DailyAssignment, HomeMember } from '../types';

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
}

export function TaskCard({ person, otherMembers, onTaskToggle, onSkipTask }: TaskCardProps) {
  // Limitar a 3 tarefas visíveis, mas mostrar todas se houver scroll
  const visibleAssignments = person.assignments.slice(0, 3);
  const hasMoreTasks = person.assignments.length > 3;
  const [selectedAssignment, setSelectedAssignment] = useState<DailyAssignment | null>(null);
  const [isSkipModalOpen, setIsSkipModalOpen] = useState(false);

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

  return (
    <div className="bg-neutral-white rounded-lg overflow-hidden shadow-sm border border-secondary-200">
      {/* Header da Pessoa */}
      <div className="bg-primary-50 px-4 py-3 border-b border-secondary-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-600">{person.initials}</span>
            </div>
            <h3 className="font-semibold text-secondary-900">{person.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-xs text-secondary-500">
              {person.completed}/{person.total} concluídas
            </p>
            <p className="text-sm font-bold text-primary-600">
              {person.currentScore} pts
            </p>
          </div>
        </div>
        {/* Barra de Progresso Horizontal */}
        <div className="w-full h-1 bg-secondary-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-300"
            style={{ width: `${(person.completed / person.total) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Tarefas da Pessoa */}
      <div className={`divide-y divide-secondary-100 ${hasMoreTasks ? 'max-h-48 overflow-y-auto' : ''}`}>
        {visibleAssignments.map((assignment) => (
          <div key={assignment.id} className="px-4 py-3 flex items-center space-x-3 hover:bg-secondary-25">
            <TaskCheckbox
              checked={assignment.completed}
              onChange={() => onTaskToggle(assignment.id)}
            />
            <div className="flex-1">
              <span
                className={`block ${
                  assignment.completed
                    ? 'line-through text-secondary-400'
                    : 'text-secondary-900'
                }`}
              >
                {assignment.taskTitle}
              </span>
              <span className="text-xs text-secondary-500">
                Peso: {assignment.taskWeight}/5
              </span>
            </div>
            {/* Ícones de Pular e Trocar */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleSkipClick(assignment)}
                className="p-1 text-secondary-400 hover:text-warning-600 transition-colors"
                title="Pular tarefa"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="p-1 text-secondary-400 hover:text-secondary-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {hasMoreTasks && (
          <div className="px-4 py-2 text-center text-xs text-secondary-500 bg-secondary-50 border-t border-secondary-200">
            +{person.assignments.length - 3} tarefa{person.assignments.length - 3 !== 1 ? 's' : ''} adicional{person.assignments.length - 3 !== 1 ? 'is' : ''}
          </div>
        )}
      </div>

      {/* Modal de Pular Tarefa */}
      <SkipTaskModal
        isOpen={isSkipModalOpen}
        assignment={selectedAssignment}
        otherMembers={otherMembers}
        onConfirm={handleSkipConfirm}
        onCancel={handleSkipCancel}
      />
    </div>
  );
}