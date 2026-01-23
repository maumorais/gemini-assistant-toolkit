# New Tools & Enhancements (v1.2.0)

- [/] Phase 1: Planning
  - [x] Brainstorming: Define "The Architect" concept
  - [ ] Detail tool specifications in `implementation_plan.md`
  - [ ] Define updates to `global_rules.txt`

- [ ] Phase 2: Implementation
  - [ ] **Tool**: Implement `ProjectPlannerTool`
    - [ ] `create_plan(goal, steps)`
    - [ ] `update_progress(step_index, status)`
  - [ ] **Service**: Implement `PlanningService` (Markdown manipulation)

- [ ] Phase 3: Instruction & Verification
  - [ ] Update `packaging/templates/global_rules.txt` (Enforce planning)
  - [ ] Verify agent behavior with new rules
  - [ ] Package & Release v1.2.0
