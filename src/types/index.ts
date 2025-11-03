// Tipos compartilhados do aplicativo DivideAí

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Home {
  id: string;
  name: string;
  description?: string;
  members: User[];
  ownerId: string;
  createdAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedTo: User;
  homeId: string;
  weight: number; // 1-5
  frequency: 'diaria' | 'semanal' | 'quinzenal';
  completed: boolean;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface Weight {
  id: string;
  taskId: string;
  value: number; // 1-5
  reason?: string;
}

export interface JusticeScore {
  userId: string;
  homeId: string;
  score: number;
  tasksCompleted: number;
  totalWeight: number;
  lastUpdated: Date;
}

export interface HomeMember {
  userId: string;
  homeId: string;
  role: 'admin' | 'member';
  joinedAt: Date;
  invitedBy: string;
  userName?: string; // Nome do usuário (buscado da coleção users)
}

export interface MemberInvite {
  id: string;
  homeId: string;
  email: string;
  invitedBy: string;
  invitedByName?: string; // Nome de quem convidou
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  respondedAt?: Date;
}

// ============ MOTOR DE DISTRIBUIÇÃO ============

export interface MonthlyScore {
  id: string;
  userId: string;
  homeId: string;
  monthKey: string; // Formato: 'YYYY-MM' (ex: '2025-11')
  score: number; // Pontuação acumulada no mês
  tasksAssigned: number; // Número de tarefas atribuídas
  totalWeight: number; // Soma dos pesos das tarefas
  lastUpdated: Date;
}

export interface DailyAssignment {
  id: string;
  taskId: string;
  taskTitle: string;
  taskWeight: number;
  assignedToId: string;
  assignedToName: string;
  homeId: string;
  dateKey: string; // Formato: 'YYYY-MM-DD' (ex: '2025-11-03')
  completed: boolean;
  completedAt?: Date;
  skipped?: boolean;
  skippedAt?: Date;
  skippedBy?: string;
  createdAt: Date;
}

export interface SkippedTask {
  id: string;
  assignmentId: string;
  taskId: string;
  taskTitle: string;
  taskWeight: number;
  originalUserId: string;
  originalUserName: string;
  homeId: string;
  dateKey: string;
  skipPenalty: number; // Pontos deduzidos
  status: 'pending' | 'offered' | 'accepted' | 'returned';
  skippedAt: Date;
  createdAt: Date;
}

export interface OfferedTask {
  id: string;
  skippedTaskId: string;
  assignmentId: string;
  taskId: string;
  taskTitle: string;
  taskWeight: number;
  originalUserId: string;
  offeredToId: string;
  offeredToName: string;
  homeId: string;
  dateKey: string;
  bonusPoints: number; // Pontos extras para aceitar
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  offeredAt: Date;
  respondedAt?: Date;
  createdAt: Date;
}

