# Changelog

All notable changes to this project will be documented in this file.

## [1.3.1] - 2026-01-29
### Added
- **ZIP Distribution**: Releases are now packaged as standalone `.zip` files in `releases/`.
- **Bundled Dependencies**: The release ZIP includes `node_modules`, enabling plug-and-play usage.

### Changed
- Refactored packaging script to clean up unzipped artifacts after ZIP creation.

## [1.3.0] - 2026-01-25
### Added
- **DevXP Suite (Feature Bundle)**: Introduced "Brain Transplant" capabilities.
- **New Tools**:
  - `ContextTool` (`context_map`): High-level project summary.
  - `VerificationTool` (`verification_agent`): Executing build/test commands.
  - `KnowledgeTool` (`knowledge_retriever`): Searching documentation.
  - `DecisionTool` (`next_step_advisor`): Recommending next actions.
  - `ReviewTool` (`code_reviewer`): Simulating code review.

### Changed
- **Documentation Strategy**: Consolidated plans and journals into `docs/` folder using `journal.md` for persistence.

## [1.2.0] - 2026-01-22
### Added
- **Git Commit Agent**: Automated conventional commits generation.
- **Silent Logger**: Automatic session context saving to `docs/journal.md`.

## [1.1.0] - 2026-01-21
### Changed
- **Architecture Refactor**: Converted monolithic script to modular OOP structure.
- **Services**: Introduced `GitService` and `JournalService`.

## [1.0.0] - 2026-01-21
### Added
- **Initial Release**: Gemini Assistant Toolkit (formerly Personal Git MCP).
- Basic Git operations and project structure.
