# Implementation Plan: "The Architect" (v1.2.0)

## Goal Description
Implement a new tool, `project_planner` (The Architect), designed to "tame" the Gemini Code Assist agent. This tool enables the agent to create and maintain structured plans (`task.md` and `implementation_plan.md`) easily.

Combined with strict `global_rules.txt`, this will force the agent to **Plan First, Act Later**.

## User Review Required
> [!IMPORTANT]
> The success of this tool relies heavily on the prompt engineering in `global_rules.txt`. We must strictly instruct the agent to use `project_planner` before any usage of `check_consistency` or code editing.

## Proposed Changes

### 1. New Tool: `ProjectPlannerTool`
*   **Name**: `project_planner`
*   **Description**: "Manages project planning artifacts. Use this to create or update implementation plans and task lists BEFORE starting any coding work."
*   **Actions**:
    *   `init_plan`: Creates `task.md` and `implementation_plan.md` from a template.
    *   `update_task`: Marks items as done/in-progress.
    *   `read_plan`: Returns current status.

### 2. New Service: `PlanningService`
*   Handles the reading/writing of Markdown files in `docs/`.
*   Ensures consistent formatting (so the agent doesn't break the file structure).

### 3. Rules Update (`packaging/templates/global_rules.txt`)
*   Add a **Protocol 0: The Architect**.
    *   *"Before writing any code, you must have an active plan in `docs/`."*
    *   *"Use `project_planner` to initialize or read the plan."*

## Verification Plan
1.  **Simulation**: Use the new rules in a fresh VS Code window.
2.  **Trigger**: Ask Gemini "Create a login form".
3.  **Expected Behavior**:
    *   Gemini: "I need to plan this first."
    *   Gemini calls `project_planner.init_plan(...)`.
    *   Gemini asks for user approval.
    *   Gemini calls `git_commit_agent` (Protocol 2) only after approval.
