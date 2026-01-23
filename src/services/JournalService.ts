import * as fs from "fs";
import * as path from "path";

export class JournalService {
    private projectRoot: string;
    private docsDir: string;
    private journalFile: string;
    private lockFile: string;

    constructor() {
        this.projectRoot = process.cwd();
        this.docsDir = path.join(this.projectRoot, "docs");
        this.journalFile = path.join(this.docsDir, "journal.md");
        this.lockFile = path.join(this.docsDir, "journal.lock");
    }

    private async sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async acquireLock(retries = 50, delay = 100): Promise<void> {
        for (let i = 0; i < retries; i++) {
            try {
                // 'wx' flag ensures atomic creation. Fails if exists.
                const fd = fs.openSync(this.lockFile, 'wx');
                fs.closeSync(fd);
                return;
            } catch (error: any) {
                if (error.code === 'EEXIST') {
                    await this.sleep(delay);
                    continue;
                }
                throw error;
            }
        }
        throw new Error(`Could not acquire lock on ${this.lockFile} after ${retries} attempts.`);
    }

    private releaseLock() {
        try {
            fs.unlinkSync(this.lockFile);
        } catch (error) {
            // Ignore if already gone
        }
    }

    public async log(objective: string, changedFiles: string[], technicalDecisions: string): Promise<string> {
        if (!fs.existsSync(this.docsDir)) {
            fs.mkdirSync(this.docsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString();
        const entryHash = Math.random().toString(36).substring(7);

        const markerStart = "<!-- STATE_START -->";
        const markerEnd = "<!-- STATE_END -->";

        const newStateBlock = `
${markerStart}
## Consolidated State
**Last Update:** ${timestamp}
**Current Objective:**
${objective}

**Technical Context & Decisions:**
${technicalDecisions}
${markerEnd}
`;

        const newHistoryEntry = `
### Entry [${entryHash}] - ${timestamp}
- **Files**: ${changedFiles.join(', ') || 'None'}
- **Summary**: ${technicalDecisions}
---
`;

        await this.acquireLock();
        try {
            let currentContent = "";
            if (fs.existsSync(this.journalFile)) {
                currentContent = fs.readFileSync(this.journalFile, 'utf8');
            }

            let finalContent = "";

            if (currentContent.includes(markerStart) && currentContent.includes(markerEnd)) {
                // Update existing state block
                const preState = currentContent.substring(0, currentContent.indexOf(markerStart));
                const postState = currentContent.substring(currentContent.indexOf(markerEnd) + markerEnd.length);

                finalContent = preState + newStateBlock + postState + newHistoryEntry;
            } else {
                // Initialize structure or migrate
                const oldHistory = currentContent.replace(/^# Project Journal\s+/, ""); // Remove header if exists to avoid dup
                finalContent = `# Project Journal\n${newStateBlock}\n\n## History\n\n${oldHistory}\n${newHistoryEntry}`;
            }

            fs.writeFileSync(this.journalFile, finalContent);
            return `Journal updated with new Consolidated State and History entry.`;
        } finally {
            this.releaseLock();
        }
    }
}
