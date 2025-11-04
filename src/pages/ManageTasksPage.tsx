// Página para cadastrar e gerenciar tarefas

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { useAuth } from '../context/AuthContext';
import { createTask, getHomeTasksById, deleteTask, updateTask } from '../services/firestoreService';
import { LuPencil, LuTrash2, LuUsers, LuWand } from 'react-icons/lu';
import { Checkbox } from '../components/Checkbox';
import { Modal } from '../components/Modal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import type { Task } from '../types';

// Biblioteca de tarefas sugeridas por categoria
const SUGGESTED_TASKS = {
  'Cozinha': [
    { title: 'Lavar a louça', weight: 2, frequency: 'diaria' as const },
    { title: 'Limpar a pia', weight: 1, frequency: 'diaria' as const },
    { title: 'Fazer café da manhã', weight: 2, frequency: 'diaria' as const },
    { title: 'Fazer almoço', weight: 3, frequency: 'diaria' as const },
    { title: 'Fazer janta', weight: 3, frequency: 'diaria' as const },
    { title: 'Limpar fogão', weight: 3, frequency: 'semanal' as const },
    { title: 'Limpeza profunda da cozinha', weight: 4, frequency: 'quinzenal' as const },
  ],
  'Limpeza': [
    { title: 'Passar aspirador', weight: 2, frequency: 'semanal' as const },
    { title: 'Varrer a casa', weight: 1, frequency: 'diaria' as const },
    { title: 'Limpar banheiro', weight: 3, frequency: 'semanal' as const },
    { title: 'Trocar toalhas', weight: 1, frequency: 'semanal' as const },
    { title: 'Lavar roupa', weight: 2, frequency: 'semanal' as const },
    { title: 'Passar roupa', weight: 3, frequency: 'semanal' as const },
    { title: 'Limpeza de vidros', weight: 2, frequency: 'semanal' as const },
    { title: 'Limpeza profunda', weight: 4, frequency: 'quinzenal' as const },
  ],
  'Jardim': [
    { title: 'Regar plantas', weight: 1, frequency: 'diaria' as const },
    { title: 'Capinar jardim', weight: 3, frequency: 'semanal' as const },
    { title: 'Podar plantas', weight: 3, frequency: 'quinzenal' as const },
    { title: 'Limpeza do jardim', weight: 2, frequency: 'semanal' as const },
  ],
  'Compras': [
    { title: 'Compras de supermercado', weight: 3, frequency: 'semanal' as const },
    { title: 'Compras de farmácia', weight: 2, frequency: 'quinzenal' as const },
  ],
  'Organização': [
    { title: 'Organizar sala', weight: 2, frequency: 'semanal' as const },
    { title: 'Organizar armários', weight: 3, frequency: 'quinzenal' as const },
    { title: 'Organizar geladeira', weight: 1, frequency: 'semanal' as const },
  ],
  'Pets': [
    { title: 'Alimentar animal de estimação', weight: 1, frequency: 'diaria' as const },
    { title: 'Limpeza da caixa de areia', weight: 2, frequency: 'diaria' as const },
    { title: 'Banho do pet', weight: 3, frequency: 'semanal' as const },
  ],
};

export function ManageTasksPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<'diaria' | 'semanal' | 'quinzenal'>('diaria');
  const [weight, setWeight] = useState(3);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editName, setEditName] = useState('');
  const [editWeight, setEditWeight] = useState(3);
  const [editFrequency, setEditFrequency] = useState<'diaria' | 'semanal' | 'quinzenal'>('diaria');
  const [showSuggestedTasks, setShowSuggestedTasks] = useState(false);
  const [selectedSuggestedTasks, setSelectedSuggestedTasks] = useState<Set<string>>(new Set());
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  useEffect(() => {
    const loadTasks = async () => {
      if (!homeId || !user) {
        setError('ID do lar ou usuário inválido. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const homeTasks = await getHomeTasksById(homeId);
        setTasks(homeTasks);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        if (errorMessage.includes('Missing or insufficient permissions')) {
          setError(
            '❌ Sem permissão para acessar tarefas. Verifique se:\n' +
            '1. Você está logado\n' +
            '2. Você é membro deste lar\n' +
            '3. As regras do Firestore foram atualizadas\n\n' +
            'ID do Lar: ' + homeId + '\n' +
            'Seu ID: ' + user.id
          );
        } else {
          setError(`Erro ao carregar tarefas: ${errorMessage}`);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [homeId, user]);

  const handleAdd = async () => {
    if (!name.trim() || !homeId || !user) return;

    try {
      setSaving(true);
      setError(null);

      const newTask = await createTask(
        homeId,
        name.trim(),
        '',
        user.id,
        weight,
        frequency
      );

      setTasks(prev => [newTask, ...prev]);
      setName('');
      setWeight(3);
      setFrequency('diaria');
    } catch (err) {
      setError('Erro ao criar tarefa');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (task: Task) => {
    setTaskToDelete(task);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      setError(null);
      await deleteTask(taskToDelete.id);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
      setTaskToDelete(null);
    } catch (err) {
      setError('Erro ao deletar tarefa');
    }
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  const handleEdit = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setEditingTask(task);
    setEditName(task.title);
    setEditWeight(task.weight);
    setEditFrequency(task.frequency);
  };

  const handleSaveEdit = async () => {
    if (!editingTask || !editName.trim()) return;

    try {
      setSaving(true);
      setError(null);

      // Atualizar no Firestore
      await updateTask(editingTask.id, {
        title: editName.trim(),
        weight: editWeight,
        frequency: editFrequency
      });

      // Atualizar no estado local
      setTasks(prev => prev.map(t => 
        t.id === editingTask.id 
          ? { ...t, title: editName.trim(), weight: editWeight, frequency: editFrequency }
          : t
      ));
      
      // Fechar modal
      setEditingTask(null);
      setEditName('');
      setEditWeight(3);
    } catch (err) {
      setError('Erro ao salvar edição');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditName('');
    setEditWeight(3);
    setEditFrequency('diaria');
  };

  const handleToggleSuggestedTask = (taskKey: string) => {
    const newSelected = new Set(selectedSuggestedTasks);
    if (newSelected.has(taskKey)) {
      newSelected.delete(taskKey);
    } else {
      newSelected.add(taskKey);
    }
    setSelectedSuggestedTasks(newSelected);
  };

  // Verifica se uma tarefa sugerida já foi importada
  const isTaskAlreadyImported = (suggestedTask: { title: string; weight: number; frequency: string }) => {
    return tasks.some(task => 
      task.title.toLowerCase() === suggestedTask.title.toLowerCase() &&
      task.weight === suggestedTask.weight &&
      task.frequency === suggestedTask.frequency
    );
  };

  // Conta quantas tarefas selecionadas ainda não foram importadas
  const getTasksToAddCount = () => {
    return Array.from(selectedSuggestedTasks).filter(taskKey => {
      const [category, taskIndex] = taskKey.split('-');
      const suggestedTask = SUGGESTED_TASKS[category as keyof typeof SUGGESTED_TASKS]?.[parseInt(taskIndex)];
      return suggestedTask && !isTaskAlreadyImported(suggestedTask);
    }).length;
  };

  const handleAddSuggestedTasks = async () => {
    if (selectedSuggestedTasks.size === 0 || !homeId || !user) return;

    try {
      setSaving(true);
      setError(null);

      // Filtrar apenas tarefas que não foram importadas ainda
      const tasksToAdd = Array.from(selectedSuggestedTasks).filter(taskKey => {
        const [category, taskIndex] = taskKey.split('-');
        const suggestedTask = SUGGESTED_TASKS[category as keyof typeof SUGGESTED_TASKS]?.[parseInt(taskIndex)];
        return suggestedTask && !isTaskAlreadyImported(suggestedTask);
      });

      for (const taskKey of tasksToAdd) {
        const [category, taskIndex] = taskKey.split('-');
        const suggestedTask = SUGGESTED_TASKS[category as keyof typeof SUGGESTED_TASKS]?.[parseInt(taskIndex)];
        
        if (suggestedTask) {
          const newTask = await createTask(
            homeId,
            suggestedTask.title,
            '',
            user.id,
            suggestedTask.weight,
            suggestedTask.frequency
          );
          setTasks(prev => [newTask, ...prev]);
        }
      }

      setSelectedSuggestedTasks(new Set());
      setShowSuggestedTasks(false);
    } catch (err) {
      setError('Erro ao adicionar tarefas sugeridas');
      console.error('Erro ao adicionar tarefas:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 pb-24">
        <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button onClick={() => navigate(-1)} className="text-secondary-500 mr-4 hover:text-secondary-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-secondary-900">Gerenciar Tarefas</h1>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-4 text-secondary-600">Carregando tarefas...</p>
          </div>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 pb-24">
      <header className="bg-neutral-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="text-secondary-500 mr-4 hover:text-secondary-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-secondary-900">Gerenciar Tarefas</h1>
            </div>
            <button
              onClick={() => navigate(`/home/${homeId}/manage-members`)}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <LuUsers className="w-4 h-4" />
              Membros
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p className="text-danger-700">{error}</p>
          </div>
        )}

        <div className="bg-neutral-white p-6 rounded-lg shadow-sm border border-secondary-200">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Adicionar Nova Tarefa</h2>

          <div className="space-y-4">
            <div>
              <label className="label">Nome da Tarefa</label>
              <input
                type="text"
                className="input w-full"
                placeholder="Ex: Lavar a louça"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Frequência</label>
              <div className="flex gap-3 mt-2">
                <button
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${frequency === 'diaria' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                  onClick={() => setFrequency('diaria')}
                >
                  Diária
                </button>
                <button
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${frequency === 'semanal' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                  onClick={() => setFrequency('semanal')}
                >
                  Semanal
                </button>
                <button
                  className={`px-3 py-2 rounded-lg font-medium transition-colors ${frequency === 'quinzenal' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                  onClick={() => setFrequency('quinzenal')}
                >
                  Quinzenal
                </button>
              </div>
            </div>

            <div>
              <label className="label">Peso da Tarefa</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="w-8 text-center font-medium text-secondary-900">{weight}</div>
              </div>
              <div className="text-sm text-secondary-600 mt-2">
                {weight === 1 && "Muito leve - tarefa rápida"}
                {weight === 2 && "Leve - tarefa simples"}
                {weight === 3 && "Médio - tarefa normal"}
                {weight === 4 && "Pesado - tarefa trabalhosa"}
                {weight === 5 && "Muito pesado - tarefa complexa"}
              </div>
            </div>

          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-3">Tarefas Cadastradas</h3>

          <div className="bg-neutral-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
            <div className="max-h-96 overflow-y-auto scroll-elegant">
              <div className="divide-y divide-secondary-100">
                {tasks.map(t => (
                  <div key={t.id} className="p-4 flex items-start justify-between hover:bg-secondary-25 transition-colors">
                    <div className="flex-1">
                      <div className="font-medium text-secondary-900">{t.title}</div>
                      <div className="text-xs text-secondary-500">{t.frequency === 'semanal' ? 'Semanal' : t.frequency === 'quinzenal' ? 'Quinzenal' : 'Diária'} • Peso: {t.weight}/5</div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button onClick={() => handleEdit(t.id)} className="text-secondary-500 hover:text-secondary-700 p-2 transition-colors">
                        <LuPencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(t)} className="text-danger-500 hover:text-danger-600 p-2 transition-colors">
                        <LuTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleAdd}
            disabled={saving}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {saving ? 'Salvando...' : 'Adicionar Tarefa'}
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={() => {
              // Inicializar com tarefas já importadas marcadas
              const alreadyImported = new Set<string>();
              Object.entries(SUGGESTED_TASKS).forEach(([category, tasks]) => {
                tasks.forEach((task, idx) => {
                  if (isTaskAlreadyImported(task)) {
                    alreadyImported.add(`${category}-${idx}`);
                  }
                });
              });
              setSelectedSuggestedTasks(alreadyImported);
              setShowSuggestedTasks(true);
            }}
            className="w-full bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <LuWand className="w-5 h-5" />
            Usar Tarefas Sugeridas
          </button>
        </div>
      </main>

      {/* Modal de Edição */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-neutral-white p-6 rounded-lg shadow-lg border border-secondary-200 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Editar Tarefa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Nome da Tarefa</label>
                <input
                  type="text"
                  className="input w-full"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="label">Peso da Tarefa</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    className="w-full h-2 bg-secondary-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="w-8 text-center font-medium text-secondary-900">{editWeight}</div>
                </div>
                <div className="text-sm text-secondary-600 mt-2">
                  {editWeight === 1 && "Muito leve - tarefa rápida"}
                  {editWeight === 2 && "Leve - tarefa simples"}
                  {editWeight === 3 && "Médio - tarefa normal"}
                  {editWeight === 4 && "Pesado - tarefa trabalhosa"}
                  {editWeight === 5 && "Muito pesado - tarefa complexa"}
                </div>
              </div>

              <div>
                <label className="label">Frequência</label>
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${editFrequency === 'diaria' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                    onClick={() => setEditFrequency('diaria')}
                  >
                    Diária
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${editFrequency === 'semanal' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                    onClick={() => setEditFrequency('semanal')}
                  >
                    Semanal
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-2 rounded-lg font-medium transition-colors ${editFrequency === 'quinzenal' ? 'bg-primary-100 text-primary-600' : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'}`}
                    onClick={() => setEditFrequency('quinzenal')}
                  >
                    Quinzenal
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editName.trim()}
                className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Tarefas Sugeridas */}
      <Modal
        isOpen={showSuggestedTasks}
        onClose={() => {
          setShowSuggestedTasks(false);
          setSelectedSuggestedTasks(new Set());
        }}
        title="Biblioteca de Tarefas Sugeridas"
        maxWidth="max-w-lg"
        footer={
          <>
            <button
              onClick={() => {
                setShowSuggestedTasks(false);
                setSelectedSuggestedTasks(new Set());
              }}
              className="flex-1 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleAddSuggestedTasks}
              disabled={saving || getTasksToAddCount() === 0}
              className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1 text-sm"
            >
              <LuWand className="w-3 h-3" />
              {saving ? 'Adicionando...' : `Adicionar (${getTasksToAddCount()})`}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-secondary-600">
            Selecione as tarefas que deseja adicionar ao seu lar. Tarefas já importadas aparecem marcadas e não podem ser selecionadas novamente.
          </p>

          <div className="max-h-80 overflow-y-auto space-y-4 scroll-elegant">
            {Object.entries(SUGGESTED_TASKS).map(([category, tasks]) => (
              <div key={category}>
                <h4 className="font-semibold text-secondary-900 mb-2 text-sm">{category}</h4>
                <div className="space-y-1">
                  {tasks.map((task, idx) => {
                    const taskKey = `${category}-${idx}`;
                    const isSelected = selectedSuggestedTasks.has(taskKey);
                    const alreadyImported = isTaskAlreadyImported(task);
                    return (
                      <div key={taskKey} className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                        alreadyImported 
                          ? 'bg-success-50 border border-success-200' 
                          : 'hover:bg-secondary-50'
                      }`}>
                        <Checkbox
                          checked={isSelected || alreadyImported}
                          onChange={() => !alreadyImported && handleToggleSuggestedTask(taskKey)}
                          size="sm"
                          disabled={alreadyImported}
                        />
                        <div className="flex-1 cursor-pointer" onClick={() => !alreadyImported && handleToggleSuggestedTask(taskKey)}>
                          <div className="flex items-center gap-2">
                            <div className={`font-medium text-secondary-900 text-sm ${alreadyImported ? 'line-through text-secondary-500' : ''}`}>
                              {task.title}
                            </div>
                            {alreadyImported && (
                              <span className="text-success-600 text-xs font-medium bg-success-100 px-2 py-0.5 rounded-full">
                                ✓ Já adicionada
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-secondary-500">
                            {task.frequency === 'diaria' && '📅 Diária'}
                            {task.frequency === 'semanal' && '📅 Semanal'}
                            {task.frequency === 'quinzenal' && '📅 Quinzenal'}
                            {' • '}
                            <span className="inline-flex items-center gap-1">
                              {'⭐'.repeat(task.weight)}
                              ({task.weight}/5)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmDeleteModal
        isOpen={!!taskToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        message={`Tem certeza que deseja excluir a tarefa "${taskToDelete?.title}"? Esta ação não pode ser desfeita.`}
        loading={saving}
      />

      <Navigation />
    </div>
  );
}
