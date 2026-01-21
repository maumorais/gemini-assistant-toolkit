# Diagnóstico e Verificação: Gemini Assistant Toolkit

Este guia ajuda a validar se o servidor MCP unificado (`gemini-assistant-toolkit`) está funcional.

## Passo 1: Verificação da Build

O novo servidor utiliza `npx tsc` para compilação.
Certifique-se de estar na raiz do projeto:

```bash
cd c:\Desenvolvimento\GitHub\gemini-assistant-toolkit
npm run build
```

**Sucesso**: O comando finaliza sem output de erro.
**Falha comum**: "tsc not found". Certifique-se de que `npm install` rodou com sucesso.

## Passo 2: Teste de Ferramentas (Verificação Automatizada)

Foi criado um script de verificação que simula uma chamada ao `silent_logger`. Execute-o:

```bash
node verify-logger.js
```

**Resultado Esperado**:
```text
Received response from server.
SUCCESS: docs/journal.md created/found.
Content Preview:
... (Markdown content) ...
SUCCESS: Content verification passed.
```

## Passo 4: Validação de Hardening (Técnico)

Para verificar a robustez contra concorrência e conflitos:

```bash
node stress-test.js
```
*Espera-se que 5 requisições concorrentes sejam processadas sequencialmente sem erro de arquivo (graças ao lock).*

**Teste de Merge Conflict**:
1. Crie um conflito em um arquivo monitorado pelo git.
2. Tente usar o Gemini para commitar.
3. **Resultado Esperado**: O agente deve recusar a ação com erro "Merge conflicts detected".

## Passo 5: Verificação de Estrutura do Journal

Abra `docs/journal.md`. Ele deve seguir este formato:
1. Cabeçalho `# Project Journal`.
2. Bloco `<!-- STATE_START -->` ... `<!-- STATE_END -->` contendo o "Consolidated State".
3. Seção `## History` abaixo, contendo as entradas antigas e novas.

## Passo 3: Verificação no Cliente (Gemini)

1. Reinicie sua sessão do Gemini (Reload Window ou novo chat).
2. O servidor deve ser carregado automaticamente via `~/.gemini/settings.json`.
3. Teste a tool `git_commit_agent` pedindo ao Gemini para criar um commit.
   - *Nota*: O Gemini agora **analisa** o diff primeiro e você só aprova a mensagem. A tool fará `git add .` automaticamente.

### Troubleshooting

- **Erro de Conexão**: Verifique se o caminho em `settings.json` aponta para `dist/toolkit-server.js` (e não `index.js`).
- **Tool não encontrada**: Certifique-se de ter rodado `npm run build` após a última atualização.
