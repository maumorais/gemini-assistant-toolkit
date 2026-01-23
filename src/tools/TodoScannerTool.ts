import { BaseTool } from "./BaseTool.js";
import { CodeService } from "../services/CodeService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class TodoScannerTool extends BaseTool {
    name = "project_tasks";
    description = "Scans the codebase for technical debt markers (TODO, FIXME, HACK).";

    private codeService: CodeService;

    constructor() {
        super();
        this.codeService = new CodeService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["scan_todos"],
                description: "Action to perform."
            }
        },
        required: ["action"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            action: z.enum(["scan_todos"]),
        });

        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
            throw new Error(`Invalid arguments: ${parseResult.error.message}`);
        }

        const findings = this.codeService.scanTodos();

        return {
            content: [{
                type: "text",
                text: findings.length === 0
                    ? "No TODOs found. Great job!"
                    : findings.map(f => `[${f.type}] ${f.file} (L${f.line}): ${f.content}`).join("\n")
            }]
        };
    }
}
