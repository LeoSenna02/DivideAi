// Serviços do Firestore para gerenciar dados

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  addDoc,
  writeBatch,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Task, JusticeScore, HomeMember, MemberInvite, MonthlyScore, DailyAssignment, TaskSwapRequest } from '../types';
import { getMonthKey, getDateKey } from './distributionService';

// ============ LARES (HOMES) ============

/**
 * Cria um novo lar
 */
export const createHome = async (
  userId: string,
  userName: string,
  homeName: string,
  description?: string
): Promise<string> => {
  try {
    if (!userId || !homeName) {
      throw new Error('Dados inválidos para criar lar');
    }

    // Criar documento do lar
    const homesRef = collection(db, 'homes');
    const homeDoc = await addDoc(homesRef, {
      name: homeName,
      description: description || '',
      ownerId: userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const homeId = homeDoc.id;

    // Adicionar criador como admin do lar
    const membersRef = collection(db, 'homeMembers');
    await addDoc(membersRef, {
      userId,
      homeId,
      role: 'admin',
      joinedAt: Timestamp.now(),
      invitedBy: null,
      userName: userName || 'Usuário',
    });

    return homeId;
  } catch (error) {
    throw new Error(`Erro ao criar lar: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

/**
 * Busca todos os lares do qual o usuário é membro
 */
export const getUserHomes = async (userId: string): Promise<Array<{ homeId: string; role: string }>> => {
  try {
    if (!userId) {
      throw new Error('ID do usuário inválido');
    }

    const membersRef = collection(db, 'homeMembers');
    const q = query(membersRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        homeId: data.homeId,
        role: data.role || 'member',
      };
    });
  } catch (error) {
    throw new Error(`Erro ao buscar lares do usuário: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

// ============ TAREFAS ============

export const createTask = async (
  homeId: string,
  title: string,
  description: string,
  assignedToId: string,
  weight: number,
  frequency: 'diaria' | 'semanal' | 'quinzenal' = 'diaria',
  dueDate?: Date
): Promise<Task> => {
  try {
    const tasksRef = collection(db, 'tasks');
    const newTaskDoc = await addDoc(tasksRef, {
      homeId,
      title,
      description,
      assignedToId,
      weight,
      frequency,
      completed: false,
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      createdAt: Timestamp.now(),
    });

    return {
      id: newTaskDoc.id,
      title,
      description,
      assignedTo: { id: assignedToId, name: '', email: '', createdAt: new Date() },
      homeId,
      weight,
      frequency,
      completed: false,
      dueDate,
      createdAt: new Date(),
    };
  } catch (error) {
    throw new Error('Erro ao criar tarefa');
  }
};

export const getHomeTasksById = async (homeId: string): Promise<Task[]> => {
  try {
    // Validação básica de entrada
    if (!homeId || typeof homeId !== 'string') {
      throw new Error('ID do lar inválido');
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('homeId', '==', homeId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      // Validação de campos obrigatórios no documento
      if (!data.title || !data.assignedToId) {
        return null; // Ou lançar erro, dependendo da estratégia
      }
      return {
        id: doc.id,
        title: data.title,
        description: data.description || '',
        assignedTo: { id: data.assignedToId, name: '', email: '', createdAt: new Date() }, // TODO: Buscar dados reais do usuário se necessário
        homeId,
        weight: data.weight || 1,
        frequency: data.frequency || 'diaria',
        completed: data.completed || false,
        dueDate: data.dueDate?.toDate?.(),
        createdAt: data.createdAt?.toDate?.() || new Date(),
        completedAt: data.completedAt?.toDate?.(),
      };
    }).filter(Boolean) as Task[]; // Filtrar nulos se houver
  } catch (error) {
    throw new Error(`Erro ao buscar tarefas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.weight && { weight: updates.weight }),
      ...(updates.frequency && { frequency: updates.frequency }),
      ...(typeof updates.completed === 'boolean' && { 
        completed: updates.completed,
        completedAt: updates.completed ? Timestamp.now() : null
      }),
      ...(updates.dueDate && { dueDate: Timestamp.fromDate(updates.dueDate) }),
    });
  } catch (error) {
    throw new Error('Erro ao atualizar tarefa');
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    throw new Error('Erro ao deletar tarefa');
  }
};

// ============ PLACAR DE JUSTIÇA ============

export const getJusticeScores = async (homeId: string): Promise<JusticeScore[]> => {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('homeId', '==', homeId));
    const snapshot = await getDocs(q);

    const scoreMap = new Map<string, JusticeScore>();

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const userId = data.assignedToId;

      if (!scoreMap.has(userId)) {
        scoreMap.set(userId, {
          userId,
          homeId,
          score: 0,
          tasksCompleted: 0,
          totalWeight: 0,
          lastUpdated: new Date(),
        });
      }

      const score = scoreMap.get(userId)!;
      if (data.completed) {
        score.tasksCompleted++;
        score.totalWeight += data.weight;
      }
    });

    return Array.from(scoreMap.values());
  } catch (error) {
    throw new Error('Erro ao buscar placar de justiça');
  }
};

// ============ MEMBROS ============

export const getHomeMembers = async (homeId: string): Promise<HomeMember[]> => {
  try {
    const membersRef = collection(db, 'homeMembers');
    const q = query(membersRef, where('homeId', '==', homeId));
    const snapshot = await getDocs(q);

    // Remover duplicatas por userId (em caso de registros duplicados)
    const uniqueMembers = new Map<string, HomeMember>();
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const memberId = data.userId;
      
      // Manter apenas um registro por usuário (o primeiro encontrado)
      if (!uniqueMembers.has(memberId)) {
        uniqueMembers.set(memberId, {
          userId: data.userId,
          homeId: data.homeId,
          role: data.role || 'member',
          joinedAt: data.joinedAt?.toDate?.() || new Date(),
          invitedBy: data.invitedBy,
          userName: data.userName || 'Usuário',
          isOnVacation: data.isOnVacation || false,
          vacationEndDate: data.vacationEndDate?.toDate?.(),
        });
      }
    });

    return Array.from(uniqueMembers.values());
  } catch (error) {
    throw new Error('Erro ao buscar membros do lar');
  }
};

export const createInvite = async (
  homeId: string,
  email: string,
  invitedBy: string
): Promise<MemberInvite> => {
  try {
    // Buscar nome de quem está convidando
    let invitedByName = 'Usuário';
    try {
      const userDocRef = doc(db, 'users', invitedBy);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        invitedByName = userData?.name || 'Usuário';
      }
    } catch (error) {
      // Usar nome padrão se não conseguir buscar
    }

    const invitesRef = collection(db, 'memberInvites');
    const newInviteDoc = await addDoc(invitesRef, {
      homeId,
      email: email.toLowerCase(),
      invitedBy,
      invitedByName, // Salvar nome junto
      status: 'pending',
      createdAt: Timestamp.now(),
    });

    return {
      id: newInviteDoc.id,
      homeId,
      email: email.toLowerCase(),
      invitedBy,
      invitedByName,
      status: 'pending',
      createdAt: new Date(),
    };
  } catch (error) {
    throw new Error('Erro ao criar convite');
  }
};

export const getHomeInvites = async (homeId: string): Promise<MemberInvite[]> => {
  try {
    // Verificar autenticação
    const { getAuth } = await import('firebase/auth');
    const auth = getAuth();
    if (!auth.currentUser) {
      return [];
    }

    const invitesRef = collection(db, 'memberInvites');
    const q = query(
      invitesRef,
      where('homeId', '==', homeId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        homeId: data.homeId,
        email: data.email,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        status: data.status || 'pending',
        createdAt: data.createdAt?.toDate?.() || new Date(),
        respondedAt: data.respondedAt?.toDate?.(),
      };
    });
  } catch (error) {
    // Retornar array vazio em caso de erro para não quebrar a UI
    return [];
  }
};;

export const getPendingInvitesForUser = async (email: string): Promise<MemberInvite[]> => {
  try {
    const invitesRef = collection(db, 'memberInvites');
    const q = query(
      invitesRef,
      where('email', '==', email.toLowerCase()),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        homeId: data.homeId,
        email: data.email,
        invitedBy: data.invitedBy,
        invitedByName: data.invitedByName,
        status: data.status,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        respondedAt: data.respondedAt?.toDate?.(),
      };
    });
  } catch (error) {
    throw new Error('Erro ao buscar convites pendentes');
  }
};

/**
 * Garante que o Admin está registrado na coleção homeMembers
 * Necessário pois o admin não recebe um convite, precisa ser adicionado manualmente
 */
export const ensureAdminInHomeMembers = async (
  homeId: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const membersRef = collection(db, 'homeMembers');
    
    // Verificar se o admin já está registrado
    const q = query(
      membersRef,
      where('homeId', '==', homeId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    // Se não existe, adicionar como admin
    if (snapshot.docs.length === 0) {
      await addDoc(membersRef, {
        userId,
        homeId,
        role: 'admin',
        joinedAt: Timestamp.now(),
        invitedBy: null,
        userName: userName || 'Usuário',
      });
    }
  } catch (error) {
    // Log silencioso - não interrompe o fluxo se falhar
    console.error('Erro ao garantir admin em homeMembers:', error);
  }
};

export const acceptInvite = async (
  inviteId: string,
  userId: string,
  homeId: string
): Promise<void> => {
  try {
    // Buscar dados do convite
    const inviteRef = doc(db, 'memberInvites', inviteId);
    const inviteSnapshot = await getDoc(inviteRef);

    if (!inviteSnapshot.exists()) {
      throw new Error('Convite não encontrado');
    }

    const inviteData = inviteSnapshot.data();

    // Buscar nome do usuário que está aceitando
    let userName = 'Usuário';
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userName = userData?.name || 'Usuário';
      }
    } catch (error) {
      // Usar nome padrão se não conseguir buscar
    }

    // Atualizar status do convite
    await updateDoc(inviteRef, {
      status: 'accepted',
      respondedAt: Timestamp.now(),
    });

    // Adicionar membro ao lar com o nome
    const membersRef = collection(db, 'homeMembers');
    await addDoc(membersRef, {
      userId,
      homeId,
      role: 'member',
      joinedAt: Timestamp.now(),
      invitedBy: inviteData.invitedBy,
      userName, // Salvar o nome junto com os dados do membro
    });
  } catch (error) {
    throw new Error('Erro ao aceitar convite');
  }
};

export const rejectInvite = async (inviteId: string): Promise<void> => {
  try {
    const inviteRef = doc(db, 'memberInvites', inviteId);
    await updateDoc(inviteRef, {
      status: 'rejected',
      respondedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new Error('Erro ao rejeitar convite');
  }
};

export const removeMember = async (homeId: string, userId: string): Promise<void> => {
  try {
    const membersRef = collection(db, 'homeMembers');
    const q = query(
      membersRef,
      where('homeId', '==', homeId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      await deleteDoc(snapshot.docs[0].ref);
    }
  } catch (error) {
    throw new Error('Erro ao remover membro');
  }
};

export const isHomeAdmin = async (homeId: string, userId: string): Promise<boolean> => {
  try {
    const membersRef = collection(db, 'homeMembers');
    const q = query(
      membersRef,
      where('homeId', '==', homeId),
      where('userId', '==', userId),
      where('role', '==', 'admin')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.length > 0;
  } catch (error) {
    return false;
  }
};

// ============ PLACAR MENSAL ============

export const getMonthlyScores = async (homeId: string, monthKey?: string): Promise<MonthlyScore[]> => {
  try {
    const currentMonth = monthKey || getMonthKey();
    const scoresRef = collection(db, 'monthlyScores');
    const q = query(
      scoresRef,
      where('homeId', '==', homeId),
      where('monthKey', '==', currentMonth)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        homeId: data.homeId,
        monthKey: data.monthKey,
        score: data.score || 0,
        tasksAssigned: data.tasksAssigned || 0,
        totalWeight: data.totalWeight || 0,
        lastUpdated: data.lastUpdated?.toDate?.() || new Date(),
      };
    });
  } catch (error) {
    throw new Error('Erro ao buscar placar mensal');
  }
};

export const updateMonthlyScore = async (
  homeId: string,
  userId: string,
  score: number,
  monthKey?: string
): Promise<void> => {
  try {
    const currentMonth = monthKey || getMonthKey();
    const scoresRef = collection(db, 'monthlyScores');
    
    // Buscar score existente
    const q = query(
      scoresRef,
      where('homeId', '==', homeId),
      where('userId', '==', userId),
      where('monthKey', '==', currentMonth)
    );
    const snapshot = await getDocs(q);

    if (snapshot.docs.length > 0) {
      // Atualizar existente
      const docRef = snapshot.docs[0].ref;
      const currentData = snapshot.docs[0].data();
      await updateDoc(docRef, {
        score: (currentData.score || 0) + score,
        tasksAssigned: (currentData.tasksAssigned || 0) + 1,
        totalWeight: (currentData.totalWeight || 0) + score,
        lastUpdated: Timestamp.now(),
      });
    } else {
      // Criar novo
      await addDoc(scoresRef, {
        homeId,
        userId,
        monthKey: currentMonth,
        score,
        tasksAssigned: 1,
        totalWeight: score,
        lastUpdated: Timestamp.now(),
      });
    }
  } catch (error) {
    throw new Error('Erro ao atualizar placar mensal');
  }
};

export const resetMonthlyScores = async (homeId: string): Promise<void> => {
  try {
    const currentMonth = getMonthKey();
    const scoresRef = collection(db, 'monthlyScores');
    const q = query(
      scoresRef,
      where('homeId', '==', homeId),
      where('monthKey', '==', currentMonth)
    );
    const snapshot = await getDocs(q);

    // Deletar todos os scores do mês atual
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  } catch (error) {
    throw new Error('Erro ao resetar placar mensal');
  }
};

// ============ ATRIBUIÇÕES DIÁRIAS ============

export const getDailyAssignments = async (
  homeId: string,
  dateKey?: string
): Promise<DailyAssignment[]> => {
  try {
    const today = dateKey || getDateKey();
    const assignmentsRef = collection(db, 'dailyAssignments');
    const q = query(
      assignmentsRef,
      where('homeId', '==', homeId),
      where('dateKey', '==', today)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        taskId: data.taskId,
        taskTitle: data.taskTitle,
        taskWeight: data.taskWeight,
        assignedToId: data.assignedToId,
        assignedToName: data.assignedToName,
        homeId: data.homeId,
        dateKey: data.dateKey,
        completed: data.completed || false,
        completedAt: data.completedAt?.toDate?.(),
        skipped: data.skipped || false,
        skippedAt: data.skippedAt?.toDate?.(),
        skippedBy: data.skippedBy,
        swapped: data.swapped || false,
        swappedAt: data.swappedAt?.toDate?.(),
        swappedWith: data.swappedWith,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  } catch (error) {
    throw new Error('Erro ao buscar atribuições diárias');
  }
};

export const getAllAssignments = async (homeId: string): Promise<DailyAssignment[]> => {
  try {
    const assignmentsRef = collection(db, 'dailyAssignments');
    const q = query(
      assignmentsRef,
      where('homeId', '==', homeId)
    );
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        taskId: data.taskId,
        taskTitle: data.taskTitle,
        taskWeight: data.taskWeight,
        assignedToId: data.assignedToId,
        assignedToName: data.assignedToName,
        homeId: data.homeId,
        dateKey: data.dateKey,
        completed: data.completed || false,
        completedAt: data.completedAt?.toDate?.(),
        skipped: data.skipped || false,
        skippedAt: data.skippedAt?.toDate?.(),
        skippedBy: data.skippedBy,
        swapped: data.swapped || false,
        swappedAt: data.swappedAt?.toDate?.(),
        swappedWith: data.swappedWith,
        createdAt: data.createdAt?.toDate?.() || new Date(),
      };
    });
  } catch (error) {
    throw new Error('Erro ao buscar todas as atribuições');
  }
};

export const saveDailyAssignments = async (
  assignments: DailyAssignment[]
): Promise<DailyAssignment[]> => {
  try {
    const assignmentsRef = collection(db, 'dailyAssignments');
    const savedAssignments: DailyAssignment[] = [];

    // Usar batch para performance
    const batch = writeBatch(db);
    const docRefs: any[] = [];

    assignments.forEach(assignment => {
      const docRef = doc(assignmentsRef);
      docRefs.push(docRef);
      batch.set(docRef, {
        taskId: assignment.taskId,
        taskTitle: assignment.taskTitle,
        taskWeight: assignment.taskWeight,
        assignedToId: assignment.assignedToId,
        assignedToName: assignment.assignedToName,
        homeId: assignment.homeId,
        dateKey: assignment.dateKey,
        completed: false,
        createdAt: Timestamp.now(),
      });
    });

    await batch.commit();

    // Retornar com IDs
    assignments.forEach((assignment, index) => {
      savedAssignments.push({
        ...assignment,
        id: docRefs[index].id,
      });
    });

    return savedAssignments;
  } catch (error) {
    throw new Error('Erro ao salvar atribuições diárias');
  }
};

export const completeAssignment = async (assignmentId: string): Promise<void> => {
  try {
    const assignmentRef = doc(db, 'dailyAssignments', assignmentId);
    await updateDoc(assignmentRef, {
      completed: true,
      completedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new Error('Erro ao marcar atribuição como completa');
  }
};

export const updateMonthlyScoresFromAssignments = async (
  homeId: string,
  updatedScores: Map<string, number>,
  assignedTasksCount: Map<string, number>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const currentMonth = getMonthKey();

    for (const [userId, score] of updatedScores.entries()) {
      const scoresRef = collection(db, 'monthlyScores');
      const q = query(
        scoresRef,
        where('homeId', '==', homeId),
        where('userId', '==', userId),
        where('monthKey', '==', currentMonth)
      );
      const snapshot = await getDocs(q);

      const tasksCount = assignedTasksCount.get(userId) || 0;

      if (snapshot.docs.length > 0) {
        // Atualizar existente
        const docRef = snapshot.docs[0].ref;
        const currentData = snapshot.docs[0].data();
        batch.update(docRef, {
          score,
          tasksAssigned: (currentData.tasksAssigned || 0) + tasksCount,
          totalWeight: score,
          lastUpdated: Timestamp.now(),
        });
      } else {
        // Criar novo
        const newDocRef = doc(scoresRef);
        batch.set(newDocRef, {
          homeId,
          userId,
          monthKey: currentMonth,
          score,
          tasksAssigned: tasksCount,
          totalWeight: score,
          lastUpdated: Timestamp.now(),
        });
      }
    }

    await batch.commit();
  } catch (error) {
    throw new Error('Erro ao atualizar placares mensais');
  }
};

// ============ SISTEMA DE SKIP COM PENALIDADE ============

const SKIP_PENALTY = 10; // Pontos deduzidos por pular
const BONUS_POINTS = 5; // Pontos extras para aceitar tarefa oferecida

/**
 * Pula uma tarefa e a oferece para outros membros com bônus
 */
export const skipAssignment = async (
  assignmentId: string,
  userId: string,
  homeId: string,
  otherMembers: Array<{ userId: string; userName: string }>
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const dateKey = getDateKey();
    const monthKey = getMonthKey();

    // 1. Marcar tarefa como pulada
    const assignmentRef = doc(db, 'dailyAssignments', assignmentId);
    const assignmentDoc = await getDoc(assignmentRef);
    
    if (!assignmentDoc.exists()) {
      throw new Error('Tarefa não encontrada');
    }

    const assignment = assignmentDoc.data() as DailyAssignment;

    batch.update(assignmentRef, {
      skipped: true,
      skippedAt: Timestamp.now(),
      skippedBy: userId,
    });

    // 2. Aplicar penalidade no score do usuário
    const scoresRef = collection(db, 'monthlyScores');
    const scoreQuery = query(
      scoresRef,
      where('userId', '==', userId),
      where('homeId', '==', homeId),
      where('monthKey', '==', monthKey)
    );
    
    const scoreDocs = await getDocs(scoreQuery);
    if (scoreDocs.docs.length > 0) {
      const scoreDoc = scoreDocs.docs[0];
      const currentData = scoreDoc.data();
      const currentScore = currentData.score || 0;
      const currentTotalWeight = currentData.totalWeight || 0;
      const newScore = Math.max(0, currentScore - SKIP_PENALTY);
      const newTotalWeight = Math.max(0, currentTotalWeight - assignment.taskWeight);
      
      batch.update(scoreDoc.ref, {
        score: newScore,
        totalWeight: newTotalWeight,
        lastUpdated: Timestamp.now(),
      });
    } else {
      // Se não existir score para este mês, criar um
      const newScoreRef = doc(collection(db, 'monthlyScores'));
      batch.set(newScoreRef, {
        userId,
        homeId,
        monthKey,
        score: Math.max(0, -SKIP_PENALTY),
        tasksAssigned: 0,
        totalWeight: Math.max(0, -assignment.taskWeight),
        lastUpdated: Timestamp.now(),
      });
    }

    // 3. Criar registro de tarefa pulada
    const skippedTaskRef = doc(collection(db, 'skippedTasks'));
    batch.set(skippedTaskRef, {
      assignmentId,
      taskId: assignment.taskId,
      taskTitle: assignment.taskTitle,
      taskWeight: assignment.taskWeight,
      originalUserId: userId,
      originalUserName: assignment.assignedToName,
      homeId,
      dateKey,
      skipPenalty: SKIP_PENALTY,
      status: 'pending',
      skippedAt: Timestamp.now(),
      createdAt: Timestamp.now(),
    });

    // 4. Oferecer tarefa para outros membros
    for (const member of otherMembers) {
      if (member.userId !== userId) {
        const offeredTaskRef = doc(collection(db, 'offeredTasks'));
        batch.set(offeredTaskRef, {
          skippedTaskId: skippedTaskRef.id,
          assignmentId,
          taskId: assignment.taskId,
          taskTitle: assignment.taskTitle,
          taskWeight: assignment.taskWeight,
          originalUserId: userId,
          offeredToId: member.userId,
          offeredToName: member.userName,
          homeId,
          dateKey,
          bonusPoints: BONUS_POINTS,
          status: 'pending',
          offeredAt: Timestamp.now(),
          createdAt: Timestamp.now(),
        });
      }
    }

    await batch.commit();
    console.log('✅ Tarefa pulada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao pular tarefa:', error);
    throw new Error(`Erro ao pular tarefa: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

/**
 * Aceita uma tarefa oferecida
 */
export const acceptOfferedTask = async (
  offeredTaskId: string,
  userId: string,
  homeId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const monthKey = getMonthKey();

    // 1. Atualizar status da tarefa oferecida
    const offeredTaskRef = doc(db, 'offeredTasks', offeredTaskId);
    const offeredTaskDoc = await getDoc(offeredTaskRef);
    
    if (!offeredTaskDoc.exists()) {
      throw new Error('Tarefa oferecida não encontrada');
    }

    const offeredTask = offeredTaskDoc.data();

    // Verificar se o usuário que pulou originalmente não pode aceitar sua própria tarefa
    if (offeredTask.originalUserId === userId) {
      throw new Error('Você não pode aceitar sua própria tarefa oferecida');
    }

    batch.update(offeredTaskRef, {
      status: 'accepted',
      respondedAt: Timestamp.now(),
    });

    // 2. Reatribuir tarefa original
    const assignmentRef = doc(db, 'dailyAssignments', offeredTask.assignmentId);
    batch.update(assignmentRef, {
      assignedToId: userId,
      assignedToName: userId, // Será atualizado com nome real depois
      skipped: false,
      skippedAt: null,
      skippedBy: null,
    });

    // 3. Atualizar score do usuário que aceitou (adiciona bônus + peso da tarefa)
    const scoresRef = collection(db, 'monthlyScores');
    const scoreQuery = query(
      scoresRef,
      where('userId', '==', userId),
      where('homeId', '==', homeId),
      where('monthKey', '==', monthKey)
    );
    
    const scoreDocs = await getDocs(scoreQuery);
    if (scoreDocs.docs.length > 0) {
      const scoreDoc = scoreDocs.docs[0];
      const currentData = scoreDoc.data();
      batch.update(scoreDoc.ref, {
        score: (currentData.score || 0) + BONUS_POINTS,
        tasksAssigned: (currentData.tasksAssigned || 0) + 1,
        totalWeight: (currentData.totalWeight || 0) + offeredTask.taskWeight,
        lastUpdated: Timestamp.now(),
      });
    }

    // 4. Atualizar status da tarefa pulada para 'offered'
    const skippedTaskRef = doc(db, 'skippedTasks', offeredTask.skippedTaskId);
    batch.update(skippedTaskRef, {
      status: 'accepted',
    });

    await batch.commit();
  } catch (error) {
    throw new Error(`Erro ao aceitar tarefa oferecida: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

/**
 * Recusa uma tarefa oferecida
 */
export const declineOfferedTask = async (offeredTaskId: string): Promise<void> => {
  try {
    const offeredTaskRef = doc(db, 'offeredTasks', offeredTaskId);
    await updateDoc(offeredTaskRef, {
      status: 'declined',
      respondedAt: Timestamp.now(),
    });
  } catch (error) {
    throw new Error(`Erro ao recusar tarefa oferecida: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

/**
 * Define o status de férias de um membro
 */
export const setMemberVacationStatus = async (
  homeId: string,
  userId: string,
  isOnVacation: boolean,
  vacationEndDate?: Date
): Promise<void> => {
  try {
    const membersRef = collection(db, 'homeMembers');
    const q = query(
      membersRef,
      where('homeId', '==', homeId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);

    if (snapshot.docs.length === 0) {
      throw new Error('Membro não encontrado');
    }

    const memberDoc = snapshot.docs[0].ref;
    await updateDoc(memberDoc, {
      isOnVacation,
      vacationEndDate: vacationEndDate ? Timestamp.fromDate(vacationEndDate) : null,
    });
  } catch (error) {
    throw new Error(`Erro ao atualizar status de férias: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

// ============ TROCA DE TAREFAS ============

/**
 * Cria um pedido de troca de tarefa
 */
export const createTaskSwapRequest = async (
  swapRequest: TaskSwapRequest
): Promise<string> => {
  try {
    // Validar que nenhuma das tarefas está pulada
    const offeredAssignmentRef = doc(db, 'dailyAssignments', swapRequest.offeredAssignmentId);
    const requestedAssignmentRef = doc(db, 'dailyAssignments', swapRequest.requestedAssignmentId);
    
    const [offeredSnap, requestedSnap] = await Promise.all([
      getDoc(offeredAssignmentRef),
      getDoc(requestedAssignmentRef)
    ]);
    
    if (!offeredSnap.exists() || !requestedSnap.exists()) {
      throw new Error('Uma ou ambas as tarefas não foram encontradas');
    }
    
    const offeredAssignment = offeredSnap.data() as DailyAssignment;
    const requestedAssignment = requestedSnap.data() as DailyAssignment;
    
    if (offeredAssignment.skipped) {
      throw new Error('Não é possível propor troca com uma tarefa pulada');
    }
    
    if (requestedAssignment.skipped) {
      throw new Error('Não é possível propor troca para uma tarefa pulada');
    }

    const swapRequestsRef = collection(db, 'taskSwapRequests');
    const newDoc = await addDoc(swapRequestsRef, {
      ...swapRequest,
      createdAt: Timestamp.now(),
    });
    return newDoc.id;
  } catch (error) {
    throw new Error(`Erro ao criar pedido de troca: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

/**
 * Obtém todos os pedidos de troca pendentes para um usuário
 */
export const getTaskSwapRequestsForUser = async (
  userId: string,
  homeId: string
): Promise<TaskSwapRequest[]> => {
  try {
    const swapRequestsRef = collection(db, 'taskSwapRequests');
    const q = query(
      swapRequestsRef,
      where('homeId', '==', homeId),
      where('requestedToUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      respondedAt: doc.data().respondedAt?.toDate?.() || undefined,
    })) as TaskSwapRequest[];
  } catch (error) {
    throw new Error(`Erro ao buscar pedidos de troca: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

/**
 * Aceita um pedido de troca de tarefa
 */
export const acceptTaskSwapRequest = async (
  swapRequestId: string,
  userId: string
): Promise<void> => {
  try {
    const swapRequestRef = doc(db, 'taskSwapRequests', swapRequestId);
    
    // Primeiro, buscar os dados da solicitação
    const swapRequestSnap = await getDoc(swapRequestRef);
    if (!swapRequestSnap.exists()) {
      throw new Error('Solicitação de troca não encontrada');
    }
    
    const swapRequest = swapRequestSnap.data() as TaskSwapRequest;
    
    // Verificar se o usuário é o destinatário correto
    if (swapRequest.requestedToUserId !== userId) {
      throw new Error('Você não tem permissão para aceitar esta solicitação');
    }
    
    // Verificar se a solicitação ainda está pendente
    if (swapRequest.status !== 'pending') {
      throw new Error('Esta solicitação já foi respondida');
    }
    
    // Buscar as atribuições atuais
    const offeredAssignmentRef = doc(db, 'dailyAssignments', swapRequest.offeredAssignmentId);
    const requestedAssignmentRef = doc(db, 'dailyAssignments', swapRequest.requestedAssignmentId);
    
    const [offeredSnap, requestedSnap] = await Promise.all([
      getDoc(offeredAssignmentRef),
      getDoc(requestedAssignmentRef)
    ]);
    
    if (!offeredSnap.exists() || !requestedSnap.exists()) {
      throw new Error('Uma ou ambas as tarefas não foram encontradas');
    }
    
    const offeredAssignment = offeredSnap.data() as DailyAssignment;
    const requestedAssignment = requestedSnap.data() as DailyAssignment;
    
    // Executar a troca em uma transação para garantir consistência
    await runTransaction(db, async (transaction) => {
      // Trocar os assignedToId e assignedToName entre as tarefas
      transaction.update(offeredAssignmentRef, {
        assignedToId: requestedAssignment.assignedToId,
        assignedToName: requestedAssignment.assignedToName,
        swapped: true,
        swappedAt: Timestamp.now(),
        swappedWith: requestedAssignment.assignedToName,
      });
      
      transaction.update(requestedAssignmentRef, {
        assignedToId: offeredAssignment.assignedToId,
        assignedToName: offeredAssignment.assignedToName,
        swapped: true,
        swappedAt: Timestamp.now(),
        swappedWith: offeredAssignment.assignedToName,
      });
      
      // Atualizar o status da solicitação
      transaction.update(swapRequestRef, {
        status: 'accepted',
        respondedAt: Timestamp.now(),
        respondedBy: userId,
      });
    });
    
  } catch (error) {
    throw new Error(`Erro ao aceitar troca: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};

/**
 * Recusa um pedido de troca de tarefa
 */
export const declineTaskSwapRequest = async (
  swapRequestId: string,
  userId: string
): Promise<void> => {
  try {
    const swapRequestRef = doc(db, 'taskSwapRequests', swapRequestId);
    
    await updateDoc(swapRequestRef, {
      status: 'declined',
      respondedAt: Timestamp.now(),
      respondedBy: userId,
    });
  } catch (error) {
    throw new Error(`Erro ao recusar troca: ${error instanceof Error ? error.message : 'Desconhecido'}`);
  }
};
