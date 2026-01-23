import simpleGit, { SimpleGit } from "simple-git";

export class GitService {
    private git: SimpleGit;

    constructor() {
        this.git = simpleGit();
    }

    public async checkConflicts(): Promise<void> {
        const status = await this.git.status();
        if (status.conflicted.length > 0) {
            throw new Error(`Merge conflicts detected in: ${status.conflicted.join(', ')}. Resolve them before committing.`);
        }
    }

    public async commit(message: string): Promise<{ branch: string; commit: string; message: string }> {
        // Logic: Zero-cost executor. "Add all" + "Commit"
        await this.git.add(".");
        const commitResult = await this.git.commit(message);

        return {
            branch: commitResult.branch,
            commit: commitResult.commit,
            message: message
        };
    }
}
