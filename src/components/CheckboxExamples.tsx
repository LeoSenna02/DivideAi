// Exemplo de uso do componente Checkbox
// Este arquivo demonstra como usar o Checkbox personalizado

import { useState } from 'react';
import { Checkbox, TaskCheckbox } from '../components/Checkbox';

export function CheckboxExamples() {
  const [task1, setTask1] = useState(false);
  const [task2, setTask2] = useState(true);
  const [task3, setTask3] = useState(false);

  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-secondary-900 mb-6">
        Exemplos do Componente Checkbox
      </h1>

      {/* TaskCheckbox - Para tarefas */}
      <section>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          TaskCheckbox - Para marcar tarefas
        </h2>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-neutral-white rounded-lg border border-secondary-200">
            <TaskCheckbox
              checked={task1}
              onChange={() => setTask1(!task1)}
            />
            <span className={task1 ? 'line-through text-secondary-400' : 'text-secondary-900'}>
              Lavar a louça
            </span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-neutral-white rounded-lg border border-secondary-200">
            <TaskCheckbox
              checked={task2}
              onChange={() => setTask2(!task2)}
            />
            <span className={task2 ? 'line-through text-secondary-400' : 'text-secondary-900'}>
              Passear com o cachorro
            </span>
          </div>

          <div className="flex items-center space-x-3 p-3 bg-neutral-white rounded-lg border border-secondary-200">
            <TaskCheckbox
              checked={task3}
              onChange={() => setTask3(!task3)}
            />
            <span className={task3 ? 'line-through text-secondary-400' : 'text-secondary-900'}>
              Limpar o banheiro
            </span>
          </div>
        </div>
      </section>

      {/* Checkbox Genérico - Formulários */}
      <section>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Checkbox Genérico - Formulários
        </h2>

        <div className="space-y-4 max-w-md">
          <Checkbox
            label="Aceito os termos de uso"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            helperText="É necessário aceitar para continuar"
          />

          <Checkbox
            label="Quero receber newsletter"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            helperText="Receba dicas e novidades por email"
          />

          <Checkbox
            label="Concordo com a política de privacidade"
            checked={privacy}
            onChange={(e) => setPrivacy(e.target.checked)}
            error={!privacy ? "Você deve concordar com a política de privacidade" : undefined}
          />
        </div>
      </section>

      {/* Tamanhos diferentes */}
      <section>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Tamanhos Disponíveis
        </h2>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <TaskCheckbox size="sm" checked={true} onChange={() => {}} />
            <span className="text-sm text-secondary-600">Small (16px)</span>
          </div>

          <div className="flex items-center space-x-2">
            <TaskCheckbox size="md" checked={true} onChange={() => {}} />
            <span className="text-sm text-secondary-600">Medium (20px)</span>
          </div>

          <div className="flex items-center space-x-2">
            <TaskCheckbox size="lg" checked={true} onChange={() => {}} />
            <span className="text-sm text-secondary-600">Large (24px)</span>
          </div>
        </div>
      </section>

      {/* Estados especiais */}
      <section>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">
          Estados Especiais
        </h2>

        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <TaskCheckbox checked={true} onChange={() => {}} />
            <span className="text-secondary-600">Selecionado</span>
          </div>

          <div className="flex items-center space-x-3">
            <TaskCheckbox checked={false} onChange={() => {}} />
            <span className="text-secondary-600">Não selecionado</span>
          </div>

          <div className="flex items-center space-x-3">
            <TaskCheckbox checked={false} disabled onChange={() => {}} />
            <span className="text-secondary-600">Desabilitado</span>
          </div>
        </div>
      </section>
    </div>
  );
}
