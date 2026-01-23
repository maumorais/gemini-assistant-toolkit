# Implementation Plan: v1.3.0 "DevXP Suite" (Batch 3)

## Goal Description
Implement 5 advanced tools to simulate "Antigravity behavior" within the Gemini Code Assist agent.

## Proposed Features (Batch 3)

### 1. `ContextTool` (`context_map`)
*   Generates a high-level summary of the project structure and key files (package.json, README, etc.) to ground the agent.

### 2. `VerificationTool` (`verification_agent`)
*   Executes pre-defined verification commands (npm test, npm run build) and returns the raw output/exit code.

### 3. `KnowledgeTool` (`knowledge_retriever`)
*   Searches `docs/` and `journal.md` for specific keywords to answer architectural questions.

### 4. `DecisionTool` (`next_step_advisor`)
*   Reads `task.md` status + `journal.md` last entry + `git status` to recommend the next logical action.

### 5. `ReviewTool` (`code_reviewer`)
*   **Action**: `review_changes`
*   **Logic**:
    1.  Gets staged files (diff).
    2.  Applies static analysis rules (simulation: check for console.log, check for missing types, check for long functions).
    3.  Returns a report: "Warning: found console.log in ..."
