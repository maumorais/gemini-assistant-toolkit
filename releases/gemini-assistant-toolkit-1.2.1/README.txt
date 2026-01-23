GEMINI ASSISTANT TOOLKIT - INSTALLATION KIT
==========================================

Este kit contém o servidor MCP "Gemini Assistant Toolkit", pronto para uso.
Inclui as dependências (node_modules) congeladas para facilitar a instalação em ambientes Windows.

PRÉ-REQUISITOS
--------------
1. Node.js (v18 ou superior) instalado.
2. Git instalado e configurado no PATH.

INSTALAÇÃO
----------
1. Copie esta pasta inteira (onde este arquivo readme.txt está) para um local permanente em sua máquina.
   Exemplo: C:\Ferramentas\gemini-toolkit

CONFIGURAÇÃO NO GEMINI
----------------------
1. Localize o arquivo de configuração do seu cliente Gemini/MCP.
   Geralmente em: %USERPROFILE%\.gemini\settings.json

2. Adicione ou atualize a seção "mcpServers" com o seguinte bloco:

   "gemini-toolkit": {
     "command": "node",
     "args": [
       "C:\\Ferramentas\\gemini-toolkit\\dist\\index.js"
     ]
   }

   IMPORTANTE: Ajuste o caminho "C:\\Ferramentas\\gemini-toolkit" para onde você copiou a pasta.

USO
---
O servidor será iniciado automaticamente pelo cliente Gemini.
Ele criará automaticamente uma pasta `docs/` na RAIZ DE CADA PROJETO onde você trabalhar, contendo o `journal.md` para persistência de contexto.

REGRAS GLOBAIS (Configuração da Inteligência)
---------------------------------------------
Para que o Gemini saiba usar as ferramentas automaticamente, você deve configurar as diretrizes de comportamento no VS Code:
1. Abra o arquivo global_rules.txt incluído neste kit e copie todo o seu conteúdo.
2. No VS Code, abra as Configurações (Ctrl + ,).
3. Pesquise por "Geminicodeassist: Rules".
4. Cole o conteúdo copiado no campo de texto Rules.

Nota: Isso garantirá que o Gemini execute o "Silent Logger" (diário de bordo) e o "Smart Commit" em qualquer projeto que você abrir, sem precisar configurar nada extra por repositório.
**Novidade v1.2.0**: Inclui 'The Architect' (project_planner), forçando o planejamento estruturado antes do código.

**Upgrade v1.2.1**: Agora inclui rchive_plan para organizar histórico de tarefas.
