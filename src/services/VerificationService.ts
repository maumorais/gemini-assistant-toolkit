import { exec } from "child_process";
import * as util from "util";
const execAsync = util.promisify(exec);

export class VerificationService {

    public async runCommand(command: string): Promise<{ stdout: string; stderr: string; exitCode: number }> {
        try {
            // Safety: We typically wouldn't allow arbitrary commands, but for developer toolkit it's acceptable.
            // Limiting to safe build/test commands is better practice for the Agent.
            const allowedPrefixes = ["npm", "node", "git", "npx"];
            if (!allowedPrefixes.some(p => command.trim().startsWith(p))) {
                throw new Error("Command not allowed. Only npm, node, git, npx commands are permitted.");
            }

            const { stdout, stderr } = await execAsync(command);
            return { stdout, stderr, exitCode: 0 };
        } catch (error: any) {
            return {
                stdout: error.stdout || "",
                stderr: error.stderr || error.message,
                exitCode: error.code || 1
            };
        }
    }
}
