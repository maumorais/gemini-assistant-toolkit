# Projeto Gemini Assistant Toolkit

## Diretrizes de Desenvolvimento

- **TypeScript Strict**: Todo código deve ser fortemente tipado.

## Identificação do Projeto

> **Project ID**: `GEMINI-TOOLKIT`
> (Este ID deve ser usado em todos os commits via `git_commit_agent`)

## Documentação e Planejamento

- **Artifacts**: Todos os planos de implementação (`implementation_plan.md`) e tarefas (`task.md`) devem ser mantidos na pasta `docs/`.
- **Archive & Reset**: Ao final de uma fase significativa (ex: release, refatoração maior), os arquivos `task.md` e `implementation_plan.md` DEVEM ser arquivados em `docs/archive/` (com nome descritivo ex: `task_v1.0.0.md`) e os arquivos principais resetados para a nova fase.


## Protocolos do Agente (Gemini)

> **CRÍTICO**: Você deve seguir estes protocolos rigorosamente.

### 1. Persistência Contínua (Silent Logger)

- **Quando**: A CADA resposta finalizada ou passo significativo.
- **Como**: Invoque a tool `silent_logger`.
- **Por quê**: Para garantir que se a sessão cair, o contexto seja salvo no **Project Journal** (`docs/journal.md`).

### 2. Fluxo de Commit "Smart" (Git Commit Agent)

- **Quando**: O usuário aprovar uma mudança ou quando o trabalho estiver pronto para checkpoint.
- **Processo**:
  1. **Analise** o contexto (diff ou edições recentes).
  2. **Gere** uma mensagem no padrão Conventional Commits (`feat: ...`, `fix: ...`).
  3. **Proponha** a mensagem ao usuário: "Posso commitar como '...'?".
  4. **Execute** chamando `git_commit_agent` (que fará `git add .` e `commit`).

### 3. Recuperação (Reboot)

- **Gatilho**: O usuário digita "reboot" ou inicia chat dizendo "voltei".
- **Gatilho**: O usuário digita "reboot" ou inicia chat dizendo "voltei".
- **Ação**:
  1. Leia o bloco **Consolidated State** no topo de `./docs/journal.md` (caminho relativo).
  2. Se necessário, leia as últimas entradas de **History** para detalhes recentes.
  3. Restaure seu foco com base nisso.
