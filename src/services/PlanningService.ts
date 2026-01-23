import * as fs from "fs";
import * as path from "path";

export class PlanningService {
    private projectRoot: string;
    private docsDir: string;
    private taskFile: string;
    private planFile: string;

    constructor() {
        this.projectRoot = process.cwd();
        this.docsDir = path.join(this.projectRoot, "docs");
        this.taskFile = path.join(this.docsDir, "task.md");
        this.planFile = path.join(this.docsDir, "implementation_plan.md");
    }

    private ensureDocsDir() {
        if (!fs.existsSync(this.docsDir)) {
            fs.mkdirSync(this.docsDir, { recursive: true });
        }
    }

    public async initPlan(goal: string, steps: string[]): Promise<string> {
        this.ensureDocsDir();

        // 1. Create Implementation Plan
        const planContent = `# Implementation Plan: ${goal}\n\n## Goal Description\n${goal}\n\n## User Review Required\n> [!NOTE]\n> Pending user approval.\n\n## Proposed Changes\n*To be defined.*\n\n## Verification Plan\n*To be defined.*`;
        fs.writeFileSync(this.planFile, planContent);

        // 2. Create Task List
        const taskContent = `# ${goal}\n\n` + steps.map(step => `- [ ] ${step}`).join("\n");
        fs.writeFileSync(this.taskFile, taskContent);

        return `Plan initialized in docs/task.md and docs/implementation_plan.md`;
    }

    public async readPlan(): Promise<string> {
        if (!fs.existsSync(this.taskFile)) return "No active plan found (docs/task.md missing).";
        return fs.readFileSync(this.taskFile, 'utf8');
    }

    public async updateTaskStatus(stepIndex: number, status: 'pending' | 'in_progress' | 'done'): Promise<string> {
        if (!fs.existsSync(this.taskFile)) throw new Error("task.md not found");

        const content = fs.readFileSync(this.taskFile, 'utf8');
        const lines = content.split('\n');

        // Simple regex to find list items: "- [ ] " or "- [x] "
        let taskCount = 0;
        const newLines = lines.map(line => {
            if (line.trim().match(/^- \[.\] /)) {
                if (taskCount === stepIndex) {
                    const mark = status === 'done' ? 'x' : (status === 'in_progress' ? '/' : ' ');
                    return line.replace(/\[.\]/, `[${mark}]`);
                }
                taskCount++;
            }
            return line;
        });

        if (stepIndex >= taskCount) throw new Error(`Task index ${stepIndex} out of bounds (found ${taskCount} tasks).`);

        fs.writeFileSync(this.taskFile, newLines.join('\n'));
        return `Updated task ${stepIndex} to status '${status}'`;
    }

    public async archiveCurrentPlan(label: string): Promise<string> {
        const archiveDir = path.join(this.docsDir, "archive");
        if (!fs.existsSync(archiveDir)) {
            fs.mkdirSync(archiveDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        // Sanitize label to be safe for filenames
        const safeLabel = label.replace(/[^a-zA-Z0-9_-]/g, "_");

        let movedFiles = [];

        if (fs.existsSync(this.taskFile)) {
            const target = path.join(archiveDir, `task_${safeLabel}.md`);
            fs.copyFileSync(this.taskFile, target);
            movedFiles.push("task.md");
        }

        if (fs.existsSync(this.planFile)) {
            const target = path.join(archiveDir, `implementation_plan_${safeLabel}.md`);
            fs.copyFileSync(this.planFile, target);
            movedFiles.push("implementation_plan.md");
        }

        if (movedFiles.length === 0) return "No active plan files found to archive.";
        return `Archived ${movedFiles.join(", ")} to docs/archive/ with label '${safeLabel}'.`;
    }
}
