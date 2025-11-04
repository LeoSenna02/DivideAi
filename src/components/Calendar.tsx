import { useState } from 'react';
import type { DailyAssignment } from '../types';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface CalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  assignments: DailyAssignment[];
  onAssignmentSelect: (assignment: DailyAssignment) => void;
  isLoading?: boolean;
}

export function Calendar({
  currentDate,
  onDateChange,
  assignments,
  onAssignmentSelect,
  isLoading = false,
}: CalendarProps) {
  const [view, setView] = useState<'month' | 'week'>('month');

  // Obter o primeiro dia do mês
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  // Obter o dia da semana do primeiro dia (0 = domingo, 1 = segunda, etc)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // Montar o grid do calendário (6 semanas)
  const weeks: Date[][] = [];
  const currentWeek: Date[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    currentWeek.push(date);

    if (currentWeek.length === 7) {
      weeks.push([...currentWeek]);
      currentWeek.length = 0;
    }
  }

  // Obter os dias da semana atual (segunda a domingo)
  const getCurrentWeekDays = (): Date[] => {
    const weekDays: Date[] = [];
    // Encontrar a segunda-feira da semana atual
    const monday = new Date(currentDate);
    const dayOfWeek = monday.getDay(); // 0 = domingo, 1 = segunda, etc.
    const diff = monday.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // ajustar para segunda-feira
    monday.setDate(diff);

    // Adicionar os 7 dias da semana
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }

    return weekDays;
  };

  const weekDays = getCurrentWeekDays();

  // Formatar chave de data
  const formatDateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Obter atribuições para um dia específico
  const getAssignmentsForDate = (date: Date): DailyAssignment[] => {
    const dateKey = formatDateKey(date);
    return assignments.filter(assignment => assignment.dateKey === dateKey);
  };

  // Verificar se é hoje
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Verificar se é a data selecionada
  const isSelected = (date: Date): boolean => {
    return (
      date.getDate() === currentDate.getDate() &&
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear()
    );
  };

  // Verificar se é o mês atual
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Navegar para o mês anterior/próximo
  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  // Navegar para a semana anterior/próxima
  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    onDateChange(newDate);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Nomes dos meses e dias
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const daysAssignmentCount = (date: Date): number => {
    return getAssignmentsForDate(date).length;
  };

  const daysCompletedCount = (date: Date): number => {
    return getAssignmentsForDate(date).filter(a => a.completed).length;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-16 sm:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header do Calendário */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 sm:px-6 py-3 sm:py-4">
        {/* Navegação e título - Mobile: vertical, Desktop: horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3 sm:gap-0">
          <div className="flex items-center justify-between sm:justify-start">
            <button
              onClick={view === 'month' ? handlePreviousMonth : handlePreviousWeek}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
              aria-label={view === 'month' ? "Mês anterior" : "Semana anterior"}
            >
              <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>

            <div className="text-center flex-1 sm:flex-none">
              {view === 'month' ? (
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
              ) : (
                <h2 className="text-sm sm:text-lg font-bold text-white">
                  Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </h2>
              )}
            </div>

            <button
              onClick={view === 'month' ? handleNextMonth : handleNextWeek}
              className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
              aria-label={view === 'month' ? "Próximo mês" : "Próxima semana"}
            >
              <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <button
            onClick={handleToday}
            className="flex-1 px-2 sm:px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
          >
            Hoje
          </button>
          <div className="flex gap-1 sm:gap-2 flex-1">
            <button
              onClick={() => setView('month')}
              className={`flex-1 px-2 sm:px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                view === 'month'
                  ? 'bg-white text-primary-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Mês
            </button>
            <button
              onClick={() => setView('week')}
              className={`flex-1 px-2 sm:px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                view === 'week'
                  ? 'bg-white text-primary-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="p-4 sm:p-6">
        {view === 'month' ? (
          <>
            {/* Nomes dos dias da semana */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4">
              {dayNames.map(day => (
                <div
                  key={day}
                  className="text-center font-semibold text-secondary-600 py-1 sm:py-2 text-xs sm:text-sm"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de datas */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {weeks.map((week, weekIndex) =>
                week.map((date, dateIndex) => {
                  const dayAssignments = getAssignmentsForDate(date);
                  const isToday_ = isToday(date);
                  const isCurrent = isCurrentMonth(date);
                  const completed = daysCompletedCount(date);
                  const total = daysAssignmentCount(date);

                  return (
                    <div
                      key={`${weekIndex}-${dateIndex}`}
                      className={`min-h-16 sm:min-h-24 p-1.5 sm:p-2 border rounded-lg transition-all cursor-pointer ${
                        isToday_
                          ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-200'
                          : isSelected(date)
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                          : isCurrent
                          ? 'bg-white border-secondary-200 hover:border-primary-300 hover:bg-primary-50'
                          : 'bg-gray-50 border-gray-200 opacity-50'
                      }`}
                      onClick={() => {
                        if (isCurrent) {
                          onDateChange(date);
                        }
                      }}
                    >
                      {/* Número do dia */}
                      <div
                        className={`text-xs sm:text-sm font-semibold mb-1 ${
                          isToday_
                            ? 'text-primary-600'
                            : isCurrent
                            ? 'text-secondary-700'
                            : 'text-secondary-400'
                        }`}
                      >
                        {date.getDate()}
                      </div>

                      {/* Indicadores de tarefas */}
                      <div className="space-y-0.5 sm:space-y-1">
                        {total > 0 && (
                          <>
                            {/* Mobile: Ponto colorido */}
                            <div className="sm:hidden flex justify-center">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  isToday_
                                    ? 'bg-primary-500'
                                    : date < new Date() && date.toDateString() !== new Date().toDateString()
                                    ? 'bg-secondary-400'
                                    : 'bg-warning-500'
                                }`}
                              />
                            </div>
                            {/* Desktop: Barra de progresso */}
                            <div className="hidden sm:flex items-center gap-1">
                              <div className="flex-1 h-1 sm:h-1.5 bg-secondary-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-success-500 transition-all"
                                  style={{
                                    width: total > 0 ? `${(completed / total) * 100}%` : '0%',
                                  }}
                                />
                              </div>
                              <span className="text-xs font-medium text-secondary-600">
                                {total}
                              </span>
                            </div>
                          </>
                        )}
                        {dayAssignments.length > 0 && dayAssignments.length <= 2 && (
                          <div className="space-y-0.5">
                            {dayAssignments.slice(0, 2).map(assignment => (
                              <div
                                key={assignment.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAssignmentSelect(assignment);
                                }}
                                className={`text-xs px-1 sm:px-1.5 py-0.5 sm:py-1 rounded truncate cursor-pointer transition-colors ${
                                  assignment.completed
                                    ? 'bg-success-100 text-success-700 line-through'
                                    : 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                                }`}
                              >
                                {assignment.taskTitle}
                              </div>
                            ))}
                            {dayAssignments.length > 2 && (
                              <div className="text-xs text-secondary-500 px-1 sm:px-1.5">
                                +{dayAssignments.length - 2} mais
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Visualização de Semana */
          <div className="space-y-4">
            {/* Header da Semana */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePreviousWeek}
                className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
                aria-label="Semana anterior"
              >
                <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>

              <div className="text-center">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Semana de {weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </h3>
              </div>

              <button
                onClick={handleNextWeek}
                className="p-2 hover:bg-primary-700 rounded-lg transition-colors"
                aria-label="Próxima semana"
              >
                <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Dias da Semana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-3 sm:gap-4">
              {weekDays.map((date, index) => {
                const dayAssignments = getAssignmentsForDate(date);
                const isToday_ = isToday(date);
                const completed = daysCompletedCount(date);
                const total = daysAssignmentCount(date);

                return (
                  <div
                    key={index}
                    className={`bg-white rounded-lg shadow-sm border p-3 sm:p-4 min-h-32 sm:min-h-40 ${
                      isToday_
                        ? 'border-primary-300 ring-2 ring-primary-200 bg-primary-50'
                        : isSelected(date)
                        ? 'border-blue-300 ring-2 ring-blue-200 bg-blue-50'
                        : 'border-secondary-200'
                    }`}
                  >
                    {/* Cabeçalho do dia */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-center flex-1">
                        <div className={`text-xs sm:text-sm font-medium ${
                          isToday_
                            ? 'text-primary-600'
                            : 'text-secondary-600'
                        }`}>
                          {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg sm:text-xl font-bold ${
                          isToday_
                            ? 'text-primary-700'
                            : 'text-secondary-900'
                        }`}>
                          {date.getDate()}
                        </div>
                      </div>
                    </div>

                    {/* Indicador de progresso */}
                    {total > 0 && (
                      <>
                        {/* Mobile: Ponto colorido */}
                        <div className="sm:hidden flex justify-center mb-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              isToday_
                                ? 'bg-primary-500'
                                : date < new Date() && date.toDateString() !== new Date().toDateString()
                                ? 'bg-secondary-400'
                                : 'bg-warning-500'
                            }`}
                          />
                        </div>
                        {/* Desktop: Barra de progresso completa */}
                        <div className="hidden sm:block mb-3">
                          <div className="flex items-center justify-between text-xs text-secondary-600 mb-1">
                            <span>{completed}/{total} tarefas</span>
                            <span>{Math.round((completed / total) * 100)}%</span>
                          </div>
                          <div className="w-full bg-secondary-200 rounded-full h-2">
                            <div
                              className="bg-success-500 h-2 rounded-full transition-all"
                              style={{ width: `${(completed / total) * 100}%` }}
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Lista de tarefas */}
                    <div className="space-y-1 max-h-20 sm:max-h-24 overflow-y-auto scroll-elegant">
                      {dayAssignments.map(assignment => (
                        <div
                          key={assignment.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignmentSelect(assignment);
                          }}
                          className={`text-xs p-1.5 sm:p-2 rounded cursor-pointer transition-colors truncate ${
                            assignment.completed
                              ? 'bg-success-100 text-success-700 line-through'
                              : 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                          }`}
                          title={assignment.taskTitle}
                        >
                          {assignment.taskTitle}
                        </div>
                      ))}
                      {dayAssignments.length === 0 && (
                        <div className="text-xs text-secondary-400 text-center py-2">
                          Sem tarefas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
