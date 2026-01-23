import { BaseTool } from "./BaseTool.js";
import { GitService } from "../services/GitService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class GitCommitTool extends BaseTool {
    name = "git_commit_agent";
    description = "Executor for Git operations with strict formatting. Receives structured arguments and assembles the commit message internally.";

    private gitService: GitService;

    constructor() {
        super();
        this.gitService = new GitService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            project_id: { type: "string", description: "Project Identifier (e.g. AUTOMATIZACAO-MORFEU)." },
            commit_type: {
                type: "string",
                enum: ["func", "fix", "refactor", "test", "docs", "style", "build"],
                description: "Commit Type (func, fix, refactor, test, docs, style, build)"
            },
            commit_title: { type: "string", description: "Short title" },
            commit_description: { type: "string", description: "Detailed description" }
        },
        required: ["project_id", "commit_type", "commit_title", "commit_description"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            project_id: z.string(),
            commit_type: z.enum(["func", "fix", "refactor", "test", "docs", "style", "build"]),
            commit_title: z.string(),
            commit_description: z.string(),
        });

        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
            throw new Error(`Invalid arguments: ${parseResult.error.message}`);
        }

        const { project_id, commit_type, commit_title, commit_description } = parseResult.data;
        const finalMessage = `${commit_type} : ${commit_title}\n\n${project_id}\n${commit_description}`;

        await this.gitService.checkConflicts();
        const result = await this.gitService.commit(finalMessage);

        return {
            content: [
                {
                    type: "text",
                    text: `Git Operation Successful.\nExecuted: git add . && git commit\nMessage:\n${finalMessage}\n\nBranch: ${result.branch}\nCommit: ${result.commit}`,
                },
            ],
        };
    }
}
