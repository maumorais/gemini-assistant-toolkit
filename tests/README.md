# Documentação dos Testes

Este diretório contém scripts auxiliares para verificar a estabilidade e funcionalidade do **Gemini Assistant Toolkit**, especificamente focados na ferramenta `silent_logger` e no comportamento do servidor MCP sob carga.

## Scripts Disponíveis

### 1. `verify-logger.js`
**Propósito:** Verificação funcional básica (Smoke Test).
- **O que faz:** Inicia o servidor, envia uma requisição `silent_logger` simulada e verificasse:
  1. O arquivo `docs/journal.md` é criado?
  2. O conteúdo do log corresponde ao enviado?
- **Uso:**
  ```bash
  node tests/verify-logger.js
  ```

### 2. `stress-test.js`
**Propósito:** Teste de Concorrência e Locking.
- **O que faz:** Dispara múltiplas requisições (padrão: 5) simultâneas para o servidor.
- **Objetivo:** Garantir que o mecanismo de *file locking* do `silent_logger` funciona corretamente, evitando condições de corrida ou corrupção do arquivo de journal.
- **Uso:**
  ```bash
  node tests/stress-test.js
  ```

### 3. `debug-logger.js`
**Propósito:** Depuração Manual.
- **O que faz:** Inicia o servidor e mantém o processo vivo por alguns segundos, imprimindo todo `STDOUT` e `STDERR` no console.
- **Objetivo:** Útil para inspecionar erros internos do servidor ou logs que não estão sendo capturados pelos outros testes.
- **Uso:**
  ```bash
  node tests/debug-logger.js
  ```

## Observações
- Todos os scripts assumem que o projeto já foi compilado (`npm run build`).
- Os scripts ajustam automaticamente os caminhos para localizar o servidor em `../dist/toolkit-server.js`.
