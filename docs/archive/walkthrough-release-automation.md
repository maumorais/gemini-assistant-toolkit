# Automated Release Packaging Walkthrough

Este documento detalha a implementação do processo automatizado de empacotamento.

## Changes

### 1. Template Storage (`release-templates/`)
- Criada pasta para armazenar arquivos estáticos que acompanham cada release:
  - `README.txt`
  - `global_rules.txt`

### 2. Automation Script (`scripts/package-release.js`)
- Script Node.js que:
  1. Lê a versão do `package.json`.
  2. Limpar e cria a estrutura de pastas em `releases/`.
  3. Compila o projeto (`npm run build`).
  4. Copia os artefatos compilados, node_modules e metadados.
  5. Copia e inclui os templates de documentação.

### 3. NPM Script
- Adicionado comando `npm run package` ao `package.json`.

### 4. Verification
#### Packaging Test
Executado `npm run package`.
- **Resultado**: Pasta `releases/gemini-assistant-toolkit-1.0.0/` criada com sucesso contendo `dist/`, `node_modules/`, `package.json` e arquivos de texto.

## Future Usage
Para criar uma nova versão:
1. Atualize a versão no `package.json`.
2. Rode `npm run package`.
3. Distribua a pasta gerada em `releases/`.
