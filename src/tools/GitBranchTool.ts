import { BaseTool } from "./BaseTool.js";
import { GitService } from "../services/GitService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class GitBranchTool extends BaseTool {
    name = "git_branch_manager";
    description = "Manages git branches (list, create, checkout).";

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
                enum: ["list_branches", "new_branch", "switch_branch"],
                description: "Action to perform."
            },
            branch_name: { type: "string", description: "Name of the branch (for new_branch or switch_branch)." }
        },
        required: ["action"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            action: z.enum(["list_branches", "new_branch", "switch_branch"]),
            branch_name: z.string().optional(),
        });

        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
            throw new Error(`Invalid arguments: ${parseResult.error.message}`);
        }

        const { action, branch_name } = parseResult.data;

        if (action === "list_branches") {
            const branches = await this.gitService.getBranches();
            return {
                content: [{
                    type: "text",
                    text: `Current: ${branches.current}\n\nAll Branches:\n${branches.all.join('\n')}`
                }]
            };
        }

        if (action === "new_branch") {
            if (!branch_name) throw new Error("branch_name is required for new_branch");
            await this.gitService.createBranch(branch_name);
            return {
                content: [{ type: "text", text: `Created and switched to new branch: ${branch_name}` }]
            };
        }

        if (action === "switch_branch") {
            if (!branch_name) throw new Error("branch_name is required for switch_branch");
            await this.gitService.checkoutBranch(branch_name);
            return {
                content: [{ type: "text", text: `Switched to branch: ${branch_name}` }]
            };
        }

        return { content: [] };
    }
}
