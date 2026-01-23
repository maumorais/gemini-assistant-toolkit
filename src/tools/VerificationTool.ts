import { BaseTool } from "./BaseTool.js";
import { VerificationService } from "../services/VerificationService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class VerificationTool extends BaseTool {
    name = "verification_agent";
    description = "Executes pre-defined verification commands (npm test, npm run build) and returns output.";

    private verificationService: VerificationService;

    constructor() {
        super();
        this.verificationService = new VerificationService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            command: { type: "string", description: "Command to run (e.g. 'npm run build', 'npm test'). Must start with npm, node, git, or npx." }
        },
        required: ["command"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            command: z.string(),
        });
        const { command } = schema.parse(args);

        const result = await this.verificationService.runCommand(command);

        return {
            content: [{
                type: "text",
                text: `Command: ${command}\nExit Code: ${result.exitCode}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
            }],
            isError: result.exitCode !== 0
        };
    }
}
