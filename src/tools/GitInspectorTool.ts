import { BaseTool } from "./BaseTool.js";
import { GitService } from "../services/GitService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class GitInspectorTool extends BaseTool {
    name = "git_inspector";
    description = "Inspects the git history and log of the repository.";

    private gitService: GitService;

    constructor() {
        super();
        this.gitService = new GitService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["history"],
                description: "Action to perform: 'history' (view recent commits)."
            },
            limit: { type: "number", description: "Number of commits to return (default: 10).", default: 10 }
        },
        required: ["action"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            action: z.enum(["history"]),
            limit: z.number().optional().default(10),
        });

        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
            throw new Error(`Invalid arguments: ${parseResult.error.message}`);
        }

        const { action, limit } = parseResult.data;

        if (action === "history") {
            const log = await this.gitService.getLog(limit);
            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(log.all, null, 2)
                }]
            };
        }

        return { content: [] };
    }
}
