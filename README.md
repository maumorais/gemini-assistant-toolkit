# Gemini Assistant Toolkit

Um servidor MCP (Model Context Protocol) projetado para automação de Git com alta fidelidade e persistência de contexto.

## Funcionalidades

- **`git_commit_agent`**: Executor "Burro" mas seguro.
  - Executa `git add .` e `git commit` com mensagem fornecida.
  - Verifica conflitos de merge antes de executar (abort se "Unmerged").
- **`silent_logger`**: Persistência de Contexto.
  - Salva o estado atual (objetivo, arquivos alterados, decisões) em `docs/journal.md`.
  - Implementa *locking* de arquivo para segurança em concorrência.
- **`project_planner` (The Architect)**: Planejamento Estruturado.
  - Cria e gerencia `docs/task.md` e `docs/implementation_plan.md`.
  - Força o agente a "Planejar antes de Agir" (com suporte da Regra Global).
  - Capacidade de arquivar planos antigos (`archive_plan`).

## Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Compile o projeto (gera a pasta `dist/`):
   ```bash
   npm run build
   # ou
   npx tsc
   ```

## Configuração no Gemini

Adicione ao seu `~/.gemini/settings.json` (ou equivalente):

```json
{
  "mcpServers": {
    "gemini-toolkit": {
      "command": "node",
      "args": [
        "c:\\Desenvolvimento\\GitHub\\gemini-assistant-toolkit\\dist\\index.js"
      ]
    }
  }
}
```

## Desenvolvimento

- `src/index.ts`: Ponto de entrada (Server Class).
- `src/tools/`: Definições das ferramentas MCP.
- `src/services/`: Lógica de negócio (Git, Journal).
- `docs/`: Documentação, journal e artefatos de planejamento.

## Troubleshooting

### Erros de Build (`npm run build`)
- **Erro**: `Cannot find name 'simpleGit'` ou problemas de tipo.
  - **Solução**: Certifique-se de que `@types/simple-git` está instalado ou que o `tsconfig.json` está lendo `node_modules` corretamente. Tente deletar `node_modules` e rodar `npm install` novamente.
- **Erro**: `tsc not found`.
  - **Solução**: O script de build está configurado para usar `npx tsc`. Certifique-se de ter o `npx` disponível ou instale typescript globalmente (`npm install -g typescript`).

### Erros de Execução
- **Erro**: `Merge conflicts detected`.
  - **Causa**: O `git_commit_agent` detectou arquivos em conflito. Resolva-os manualmente antes de pedir para o agente commitar novamente.
- **Erro**: `Could not acquire lock`.
  - **Causa**: O `silent_logger` tentou escrever enquanto outro processo estava escrevendo. O sistema tenta automaticamente (retry), mas se persistir, verifique se não há zumbis do node rodando.

## Distribuição (Release)

Para gerar um novo pacote de distribuição (Kit de Instalação):

1. Atualize a versão no `package.json`.
2. Execute o comando:
   ```bash
   npm run package
   ```
3. O kit será gerado em `releases/gemini-assistant-toolkit-<versao>/`.
