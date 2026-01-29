# Implementation Plan: ZIP Release Distribution

## Goal Description
Enhance the release process to generate a standalone `.zip` archive for each version. This archive will contain the full codebase, including built artifacts (`dist/`) and production dependencies (`node_modules/`), enabling "download & run" usage without requiring `npm install`. The ZIP files will be versioned in Git.

## User Review Required
> [!WARNING]
> **Repository Size**: Versioning ZIP files containing `node_modules` will significantly increase the repository size over time.
> **Cross-Platform**: `node_modules` installed on Windows may not work on Linux/Mac if native bindings are present (though mostly pure JS for this toolkit, it's a risk).

## Proposed Changes

### Packaging
#### [MODIFY] [package-release.js](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/packaging/scripts/package-release.js)
- Add `archiver` (or `adm-zip`) logic to compress the release folder.
- Ensure the ZIP is placed in `releases/`.
- Ensure the ZIP includes `node_modules`.

### Dependencies
#### [MODIFY] [package.json](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/package.json)
- Add `archiver` to `devDependencies`.

### Configuration
#### [MODIFY] [.gitignore](file:///c:/Desenvolvimento/GitHub/gemini-assistant-toolkit/.gitignore)
- Ensure `.zip` files in `releases/` are **NOT** ignored (allow listing them).

## Verification Plan

### Automated Tests
- Run `npm run package`.
- Check if `releases/gemini-assistant-toolkit-x.x.x.zip` exists.
- Check ZIP size (should be > 1MB due to node_modules).
- Unzip and run `node dist/toolkit-server.js` to verify it works.
