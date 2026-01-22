# Plano de Implementação: Git MCP Agent

Este plano detalha a construção de um servidor MCP em Node.js focado em automação de Git com "alta fidelidade".

## User Review Required

> [!IMPORTANT]
> O servidor será implementado em **TypeScript** para garantir tipagem forte e melhor manutenibilidade, rodando sobre Node.js.

## Proposed Changes

### Phase 0: Initial Configuration
#### [NEW] [.gitignore](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/.gitignore)
- Ignorar `node_modules`, `dist`, logs e outros arquivos de sistema.

#### [NEW] [GEMINI.md](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/GEMINI.md)
- Arquivo de memória do projeto e diretrizes gerais.

### Project Structure
#### [NEW] [package.json](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/package.json)
- Dependências: `@modelcontextprotocol/sdk`, `zod` (para validação de schema), `typescript`, `simple-git` (para operações git facilitadas).

#### [NEW] [tsconfig.json](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/tsconfig.json)
- Configuração estrita para TypeScript.

### MCP Server Core
#### [NEW] [src/index.ts](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/src/index.ts)
- Implementação do servidor MCP.
- Definição da tool `git_commit_agent`.
- Lógica de execução:
  1. Verificar `git diff --staged`. Se vazio, erro amigável.
  2. Executar commit com mensagem fornecida.
  3. Validar se a mensagem segue Conventional Commits (pode ser feito pré ou pós, mas o pedido implica que o agente "propõe", a tool executa. A tool vai aceitar a mensagem já pronta, mas validar formato).
  4. Executar push se `auto_push` for true.

### Documentation & Config
#### [NEW] [README.md](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/README.md)
- Guia de uso e instalação.

#### [NEW] [docs/diagnostics.md](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/docs/diagnostics.md)
- Guia para validar se a tool está ativa.

#### [MODIFY] [GEMINI.md](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/GEMINI.md)
- Adicionar template de instrução "Chain of Thought".

## Verification Plan

### Automated Tests
- Não aplicável para este escopo inicial (testes manuais via cliente MCP).


### Phase 1: Refactor & Upgrade to Gemini Assistant Toolkit

#### [NEW] [src/toolkit-server.ts](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/src/toolkit-server.ts)
- **Consolidação**: Substitui `src/index.ts`.
- **Renomeação**: Servidor passa a ser `gemini-assistant-toolkit`.

#### [MODIFY] [Tool: git_commit_agent]
- **Mudança de Lógica**: Simplificação.
  - Remove análise interna de diff (delegada ao Gemini).
  - Executa `git add .` automaticamente antes do commit.
  - Recebe `commit_message` e executa.

#### [NEW] [Tool: silent_logger]
- **Objetivo**: Persistência de contexto "Shadow".
- **Input**: `objective`, `changed_files`, `technical_decisions`.
- **Ação**: Escreve em `~/.gemini/shadow_context.json`.

#### [MODIFY] [GEMINI.md](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/GEMINI.md)
- **Novas Diretrizes**:
  1. **Checkpoint Automático**: Invocar `silent_logger` a cada resposta.
  2. **Smart Commit Flow**: Análise via contexto -> Sugestão -> `git_commit_agent`.
  3. **Reboot Protocol**: Ler `shadow_context.json` ao iniciar com "reboot".

#### [MODIFY] [package.json](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/package.json)
- Atualizar script de build/start para o novo entrypoint.

#### [MODIFY] [docs/gemini-settings-snippet.json]
- Atualizar caminho para o novo script compilado.

### Phase 2: Refactor Silent Logger (Project-Local)

#### [MODIFY] [src/toolkit-server.ts]
- **Mudança de Caminho**: De `~/.gemini/shadow_context.json` para `<project_root>/docs/journal.md`.
- **Resolução de Caminho**: Usar `path.resolve(__dirname, '..', 'docs')` para garantir que seja relativo à instalação do server, independente do CWD.
- **Formato**: Markdown legível (não apenas JSON).

#### [MODIFY] [docs/diagnostics.md]
- Atualizar referência ao arquivo de log.

### Verification
- Rebuild (`npm run build`).
- Rodar teste atualizado para verificar se `docs/journal.md` é criado.
### Phase 4: Technical Hardening

#### [MODIFY] [src/toolkit-server.ts]
- **Silent Logger Locking**: Implementar mecanismo de *retry* com `lockfile` simples para evitar condições de corrida (multiprocess safety).
- **Git Safety**: Adicionar verificação de `git status` antes do commit para detectar arquivos "Unmerged" (conflitos) e abortar se necessário.
- **Resource Check**: Garantir uso de métodos síncronos/atomic para arquivos simples ou streams gerenciadas.

### Verification
- Rebuild.
- Testar commit simulando conflito (manual ou script).
- Testar logger concorrente (script de stress).
### Phase 6: Silent Logger Consolidator (Refactor v2)

#### [MODIFY] [src/toolkit-server.ts]
- **Objetivo**: Otimizar recuperação de contexto (tokens).
- **Lógica**:
  1. Ler arquivo existente (com Lock).
  2. Identificar bloco de "Estado Atual" (regex/markers).
  3. Atualizar bloco de Estado com input atual.
  4. Manter histórico antigo + append da nova entrada.
  5. Reescrever arquivo completo.
- **Estrutura do Journal**:
  ```markdown
  # Project Journal

  <!-- STATE_START -->
  ## Current Focus
  ... (Updated Content) ...
  <!-- STATE_END -->

  ## History
  ... (Append Only) ...
  ```

### Verification
- Rodar script que simula múltiplas chamadas e verificar se o Header muda mas o histórico cresce.
### Phase 7: Pro Refinement & Cleanup

#### [Reference] [src/toolkit-server.ts]
- **Review**: Confirmar `fs.mkdirSync(docsDir, { recursive: true })` está presente.

#### [MODIFY] [README.md]
- **Install Guide**: Explicitar `npm install` e `npx tsc` (ou `npm run build`).

#### [MODIFY] [GEMINI.md]
- **Protocol**: Ajustar caminho de reboot para `./docs/journal.md`.

#### [MODIFY] [.gitignore]
- **Cleanup**: Garantir que `dist/` e `node_modules/` estejam ignorados, mas `docs/` rastreado.

### Phase 8: Refactor Test Scripts Location

Mover arquivos de teste da raiz para a pasta `tests/` para manter a raiz limpa.

#### [NEW] [tests/](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/tests)
- Criar diretório para scripts de teste.

#### [MOVE & MODIFY] `verify-logger.js`
- Mover para `tests/verify-logger.js`
- Atualizar caminho do servidor: `path.join(__dirname, '..', 'dist', 'toolkit-server.js')`
- Atualizar caminho do journal: `path.join(__dirname, '..', 'docs', 'journal.md')`

#### [MOVE & MODIFY] `stress-test.js`
- Mover para `tests/stress-test.js`
- Atualizar caminho do servidor: `path.join(__dirname, '..', 'dist', 'toolkit-server.js')`

#### [MOVE & MODIFY] `debug-logger.js`
- Mover para `tests/debug-logger.js`
- Atualizar caminho do servidor: `path.join(__dirname, '..', 'dist', 'toolkit-server.js')`

#### [NEW] `tests/README.md`
- Documentação dos scripts de teste.

### Verification
- Executar `node tests/verify-logger.js` a partir da raiz.
- Executar `node tests/stress-test.js` a partir da raiz.

### Phase 9: Installation Kit

Criar um pacote de distribuição "Unzip & Run" para facilitar o uso do servidor por terceiros.

#### [MODIFY] `src/toolkit-server.ts`
- **Current Behavior**: Journal is saved in `<server_install_dir>/docs`.
- **New Behavior**: Journal should be saved in `<current_working_directory>/docs`.
- **Reason**: Allows the server to be installed once and used across multiple projects, keeping context local to each project.

#### [NEW] [release/](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/release)
- Diretório temporário para montar o kit.

#### Contents
1. **`dist/`**: Código compilado (`toolkit-server.js`).
2. **`node_modules/`**: Dependências pré-instaladas (Frozen/Vendored).
3. **`package.json`**: Metadados.
4. **`README.txt`**: Instruções de uso e configuração.
5. **`global_rules.txt`**: Extraído de `GEMINI.md`.

#### Exclusions
- **`tests/`**: Não será incluído.
- **`src/`**: Não será incluído.
- **`docs/`**: Não sera incluída (criada dinamicamente).

### Phase 10: Automated Release Packaging

Criar um processo automatizado para gerar kits de instalação versionados.

#### [NEW] [packaging/templates/](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/packaging/templates)
- Armazenar os arquivos estáticos do kit (`README.txt`, `global_rules.txt`).

#### [NEW] [packaging/scripts/package-release.js](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/packaging/scripts/package-release.js)
- **Lógica**:
  1. Ler arquivo `package.json` para obter a versão atual (ex: `1.0.0`).
  2. Limpar/recriar pasta `releases/`.
  3. Criar subpasta `releases/gemini-assistant-toolkit-1.0.0` (dinâmico).
  4. Executar build (`npx tsc`).
  5. Copiar `dist/`, `package.json`, `node_modules` para a subpasta.
  6. Copiar templates (`README.txt`, `global_rules.txt`) para a subpasta.

#### [MODIFY] [package.json]
- Adicionar script: `"package": "node packaging/scripts/package-release.js"`.

#### [MODIFY] [README.md]
- Adicionar seção "Distribuição" explicando como gerar novos releases usando o comando.

### Verification Plan
- Executar `npm run package`.
- Verificar se a pasta criada em `releases/` tem a versão correta do `package.json`.
- Verificar conteúdo da pasta.

### Phase 11: Consolidate Packaging Checklists

Mover pastas "administrativas" (`scripts/` e `release-templates/`) para uma pasta dedicada `packaging/` para limpar a raiz do projeto.

#### [NEW] [packaging/](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/packaging)
- Nova pasta raiz para recursos de empacotamento.

#### [MOVE] `release-templates/` -> `packaging/templates/`
- Organização de templates.

#### [MOVE] `scripts/` -> `packaging/scripts/`
- Scripts de automação.

#### [MODIFY] [package.json]
- Atualizar script `package`:
  `"package": "node packaging/scripts/package-release.js"`

#### [MODIFY] [packaging/scripts/package-release.js]
- Atualizar `PROJECT_ROOT`:
  ```javascript
  // Antes (em scripts/): path.resolve(__dirname, '..')
  // Agora (em packaging/scripts/): path.resolve(__dirname, '..', '..')
  ```
- Atualizar `TEMPLATES_DIR`:
  `path.join(PROJECT_ROOT, 'packaging', 'templates')`

### Verification Plan
- Executar `npm run package`.
- Verificar se o build e o empacotamento continuam funcionando.

### Phase 12: Rebranding

Alterar identidade do projeto de `gemini-assistant-toolkit` para `gemini-assistant-toolkit`.

#### [MODIFY] [package.json]
- **Name**: `gemini-assistant-toolkit`
- **Repository**: `https://github.com/maumorais/gemini-assistant-toolkit`

#### [MODIFY] [README.md]
- Atualizar Título.
- Atualizar paths para `c:\Desenvolvimento\GitHub\gemini-assistant-toolkit`.

#### [MODIFY] [docs/*]
- Atualizar referências de caminhos absolutos.

### Cleanup
- Remover pasta `releases/`.

### Phase 13: Post-Rebranding Verification

## Goal
Verify that the project builds and packages correctly after the repository and folder renaming.

## Proposed Changes
No code changes are expected unless the verification fails. This is strictly a verification phase.

## Verification Plan

### 1. Script Validation
- Review `package.json` to ensure script names align with current structure.
- Review `packaging/scripts/package-release.js` for any hardcoded paths that might reference the old folder name.

### 2. Execution
- Run `npm install` (ensure dependencies are clean).
- Run `npm run build` (verify TypeScript compilation).
- Run `npm run package` (verify release kit generation).

### 3. Validation
- Inspect the generated `releases/` directory.
- Check if `README.txt` and `global_rules.txt` are correctly copied.
- Check if `dist/` contains the compiled output.

### Phase 15: Implement Strict Commit Pattern

## Goal
Enforce a standardized commit message format across all projects using the `git_commit_agent`.
Format:
```text
<TYPE> : <TITLE>

<PROJECT_ID>
<DESCRIPTION>
```

## User Review Required
> [!IMPORTANT]
> This is a breaking change for the `git_commit_agent` tool signature. The Agent must provide structured arguments instead of a single message string.

## Proposed Changes

### 1. Refactor Tool Schema (`src/toolkit-server.ts`)
- **Remove**: `commit_message` (string).
- **Add**:
  - `project_id` (string, required): The project identifier (e.g., `AUTOMATIZACAO-MORFEU`).
  - `commit_type` (enum, required): `func`, `fix`, `refactor`, `test`, `docs`, `style`, `build`.
  - `commit_title` (string, required): Short summary.
  - `commit_description` (string, required): Detailed description.

### 2. Implement Formatting Logic
- Inside the tool execution, construct the final message:
  ```typescript
  const finalMessage = `${args.commit_type} : ${args.commit_title}\n\n${args.project_id}\n${args.commit_description}`;
  ```
- Pass this `finalMessage` to the git command.

### 3. Update Project Context (`GEMINI.md`)
- Add a dedicated section or header to define the `Project ID` for the current project (`gemini-assistant-toolkit`).
- **Action Required**: Define ID for this project (Suggested: `GEMINI-TOOLKIT`).

## Verification Plan

### Manual Verification
1.  Attempt to commit using the new tool signature.
2.  Verify `git log` shows the exact formatting with the correct spacing and ID.
3.  Attempt to commit with an invalid type (e.g., `feat`) and ensure it fails validation.

### Phase 16: Release 1.0.1

## Goal
Package and release version 1.0.1, including the new Strict Commit Pattern rules and updated templates.

## Proposed Changes
1.  **Version Bump**: Update `package.json` to 1.0.1.
2.  **Template Update**: Ensure `global_rules.txt` in templates reflects the new strict commit pattern.
3.  **Packaging**: Run `npm run package` to generate the release artifact.

## Verification
- Check `releases/gemini-assistant-toolkit-1.0.1` existence.
- Verify `package.json` version inside the release.
- Verify `global_rules.txt` content inside the release.
