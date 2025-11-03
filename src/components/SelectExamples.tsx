// Exemplo de uso do componente Select

import { Select } from '../components/Select';

export function SelectExamples() {
  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-bold text-secondary-900">Componente Select - Exemplos</h2>

      {/* Select básico */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">Select Básico</h3>
        <Select
          label="Escolha uma opção"
          options={[
            { value: 'option1', label: 'Opção 1' },
            { value: 'option2', label: 'Opção 2' },
            { value: 'option3', label: 'Opção 3' }
          ]}
          placeholder="Selecione uma opção"
        />
      </div>

      {/* Select com valor padrão */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">Com Valor Padrão</h3>
        <Select
          label="Status da tarefa"
          value="completed"
          options={[
            { value: 'pending', label: 'Pendente' },
            { value: 'in-progress', label: 'Em andamento' },
            { value: 'completed', label: 'Concluída' }
          ]}
        />
      </div>

      {/* Select com erro */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">Com Erro</h3>
        <Select
          label="Campo obrigatório"
          error="Este campo é obrigatório"
          options={[
            { value: 'a', label: 'Opção A' },
            { value: 'b', label: 'Opção B' }
          ]}
        />
      </div>

      {/* Select com texto auxiliar */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">Com Texto Auxiliar</h3>
        <Select
          label="Frequência da tarefa"
          helperText="Escolha a frequência com que a tarefa deve ser repetida"
          options={[
            { value: 'diaria', label: 'Diária' },
            { value: 'semanal', label: 'Semanal' },
            { value: 'quinzenal', label: 'Quinzenal' }
          ]}
        />
      </div>

      {/* Select com opção desabilitada */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">Com Opção Desabilitada</h3>
        <Select
          label="Membro responsável"
          options={[
            { value: 'user1', label: 'João Silva' },
            { value: 'user2', label: 'Maria Santos', disabled: true },
            { value: 'user3', label: 'Pedro Costa' }
          ]}
        />
      </div>

      {/* Tamanhos diferentes */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">Tamanhos Diferentes</h3>
        <div className="space-y-4">
          <Select
            size="sm"
            label="Tamanho Pequeno"
            options={[
              { value: '1', label: 'Pequeno' }
            ]}
          />
          <Select
            size="md"
            label="Tamanho Médio (padrão)"
            options={[
              { value: '1', label: 'Médio' }
            ]}
          />
          <Select
            size="lg"
            label="Tamanho Grande"
            options={[
              { value: '1', label: 'Grande' }
            ]}
          />
        </div>
      </div>

      {/* Select full width */}
      <div>
        <h3 className="text-lg font-semibold text-secondary-800 mb-2">Full Width</h3>
        <Select
          label="Seleção em largura total"
          fullWidth
          options={[
            { value: '1', label: 'Opção 1' },
            { value: '2', label: 'Opção 2' },
            { value: '3', label: 'Opção 3' }
          ]}
        />
      </div>
    </div>
  );
}