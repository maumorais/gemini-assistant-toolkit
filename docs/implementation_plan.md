# Implementation Plan: " The Architect" Upgrade (v1.2.1)

## Goal Description
Enhance `project_planner` to automate the "Archive & Reset" strategy. This allows the user/agent to close a phase and save history with a single command, keeping `docs/` clean.

## Proposed Changes

### 1. Update Service: `PlanningService`
*   **Method**: `archiveCurrentPlan(label: string)`
*   **Logic**:
    1.  Check if `docs/archive/` exists (create if not).
    2.  Copy `task.md` -> `docs/archive/task_<label>.md`.
    3.  Copy `implementation_plan.md` -> `docs/archive/plan_<label>.md`.
    4.  (Optional) Reset the current files to a blank template? -> *Decision: No, just archive. The next `init_plan` will overwrite/reset them.*

### 2. Update Tool: `ProjectPlannerTool`
*   **Action**: `archive_plan`
*   **Arguments**: `archive_label` (Required).
*   **Description**: "Archives the current plan/task items to `docs/archive/` for historical reference."

## Verification Plan
1.  **Test**: Call `project_planner` with action `archive_plan` and label `test_v1.2.1`.
2.  **Expectation**: Files appear in `docs/archive/` with the correct suffix.
