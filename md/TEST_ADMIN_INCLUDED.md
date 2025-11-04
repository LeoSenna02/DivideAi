// TESTE: Verificar que Admin está incluído
// Este arquivo contém exemplos de como verificar que o admin funciona

// ============ TESTE 1: Verificar Membros Buscados ============
// Abra o console do navegador (F12) e execute:

async function testarMembros() {
  const { getHomeMembers } = await import('./services/firestoreService.js');
  const membros = await getHomeMembers('seu-home-id'); // Substitua pelo homeId real
  
  console.log('=== MEMBROS CARREGADOS ===');
  membros.forEach(m => {
    console.log(`- ${m.userName} (${m.role}) - ID: ${m.userId}`);
  });
  
  const temAdmin = membros.some(m => m.role === 'admin');
  console.log(`Admin incluído? ${temAdmin ? '✅ SIM' : '❌ NÃO'}`);
  
  return membros;
}

// ============ TESTE 2: Verificar Validação ============
// Execute após teste 1:

async function testarValidacao() {
  const { validateMembersForDistribution } = await import('./services/distributionService.js');
  const membros = await testarMembros();
  
  console.log('\n=== VALIDAÇÃO DE MEMBROS ===');
  const validados = validateMembersForDistribution(membros);
  
  console.log(`Membros antes: ${membros.length}`);
  console.log(`Membros depois: ${validados.length}`);
  
  validados.forEach(m => {
    console.log(`✅ ${m.userName} (${m.role})`);
  });
}

// ============ TESTE 3: Verificar Sorteio (Simulado) ============
// Este teste simula o sorteio 1000 vezes para ver a distribuição

async function testarSorteio() {
  const { getHomeMembers, getMonthlyScores } = await import('./services/firestoreService.js');
  const { validateMembersForDistribution, calculateCurrentScores, weightedRandomSelection } = await import('./services/distributionService.js');
  
  const homeId = 'seu-home-id'; // Substitua pelo homeId real
  const membros = await getHomeMembers(homeId);
  const validados = validateMembersForDistribution(membros);
  const placares = await getMonthlyScores(homeId);
  const scores = calculateCurrentScores(validados, placares);
  
  console.log('\n=== TESTE DE SORTEIO (1000 rodadas) ===');
  console.log('Placar atual:');
  validados.forEach(m => {
    console.log(`  ${m.userName}: ${scores.get(m.userId) || 0} pontos`);
  });
  
  // Simular sorteio
  const contadores = new Map();
  validados.forEach(m => contadores.set(m.userId, 0));
  
  for (let i = 0; i < 1000; i++) {
    const sorteado = weightedRandomSelection(validados, scores);
    contadores.set(sorteado, (contadores.get(sorteado) || 0) + 1);
  }
  
  console.log('\nResultado do sorteio (1000 tentativas):');
  validados.forEach(m => {
    const count = contadores.get(m.userId);
    const percentual = ((count / 1000) * 100).toFixed(1);
    console.log(`  ${m.userName}: ${count} vezes (${percentual}%)`);
  });
  
  // Verificar se admin foi sorteado
  const adminMember = validados.find(m => m.role === 'admin');
  if (adminMember) {
    const adminSorteios = contadores.get(adminMember.userId);
    if (adminSorteios > 0) {
      console.log(`\n✅ ADMIN FOI SORTEADO ${adminSorteios} VEZES!`);
    } else {
      console.log(`\n❌ ADMIN NÃO FOI SORTEADO (erro!)`);
    }
  }
}

// ============ TESTE 4: Verificar Atribuições no Firestore ============
// Após distribuir tarefas, execute:

async function testarAtribuicoes() {
  const { getDailyAssignments } = await import('./services/firestoreService.js');
  
  const homeId = 'seu-home-id'; // Substitua pelo homeId real
  const atribuicoes = await getDailyAssignments(homeId);
  
  console.log('\n=== ATRIBUIÇÕES DO DIA ===');
  
  const agrupado = new Map();
  atribuicoes.forEach(a => {
    if (!agrupado.has(a.assignedToName)) {
      agrupado.set(a.assignedToName, []);
    }
    agrupado.get(a.assignedToName).push(a);
  });
  
  agrupado.forEach((tarefas, pessoa) => {
    console.log(`\n${pessoa}:`);
    tarefas.forEach(t => {
      const status = t.completed ? '✅' : '⏳';
      console.log(`  ${status} ${t.taskTitle} (Peso: ${t.taskWeight})`);
    });
  });
  
  // Verificar se admin recebeu tarefas
  const adminTemTarefas = Array.from(agrupado.keys()).some(nome => 
    nome.toLowerCase().includes('admin') || 
    nome.toLowerCase().includes('seu-nome')
  );
  
  if (adminTemTarefas) {
    console.log('\n✅ ADMIN RECEBEU TAREFAS!');
  } else {
    console.log('\n⚠️ Admin não aparece nas atribuições');
  }
}

// ============ TESTE 5: Verificar Placar Mensal ============
// Execute após teste 4:

async function testarPlacarMensal() {
  const { getMonthlyScores } = await import('./services/firestoreService.js');
  
  const homeId = 'seu-home-id'; // Substitua pelo homeId real
  const placares = await getMonthlyScores(homeId);
  
  console.log('\n=== PLACAR MENSAL ===');
  
  if (placares.length === 0) {
    console.log('Nenhum placar registrado ainda.');
    return;
  }
  
  placares.forEach(p => {
    console.log(`${p.userId}: ${p.score} pontos (${p.tasksAssigned} tarefas)`);
  });
  
  // Verificar se admin tem pontos
  const adminScore = placares.find(p => p.userId.includes('admin'));
  if (adminScore && adminScore.score > 0) {
    console.log(`\n✅ ADMIN TEM SCORE: ${adminScore.score} pontos!`);
  } else {
    console.log('\n⚠️ Admin ainda não tem score (pode estar tudo certo, apenas não distribuído ainda)');
  }
}

// ============ EXECUTAR TODOS OS TESTES ============
// No console do navegador, execute:

async function executarTodosTestes() {
  console.log('🧪 INICIANDO TESTES...\n');
  
  try {
    await testarMembros();
    await testarValidacao();
    await testarSorteio();
    await testarAtribuicoes();
    await testarPlacarMensal();
    
    console.log('\n✅ TODOS OS TESTES CONCLUÍDOS!');
  } catch (erro) {
    console.error('❌ Erro durante testes:', erro);
  }
}

// Copie e cole isto no console:
// await executarTodosTestes();

// ============ CHECKLIST DE VALIDAÇÃO ============
/*
Após executar os testes, verifique:

✅ TESTE 1 - Membros Buscados
  [ ] Admin aparece na lista?
  [ ] Tem role 'admin'?

✅ TESTE 2 - Validação
  [ ] Membros antes = Membros depois?
  [ ] Admin continua incluído?

✅ TESTE 3 - Sorteio
  [ ] Admin foi sorteado?
  [ ] Percentual reasonable (não 0%)?

✅ TESTE 4 - Atribuições
  [ ] Admin recebeu tarefas?
  [ ] Tarefas têm peso correto?

✅ TESTE 5 - Placar Mensal
  [ ] Admin tem score atualizado?
  [ ] Score incrementa corretamente?

Se todos os ✅, admin está 100% funcional!
*/
