import { BaseTool } from "./BaseTool.js";
import { CodeService } from "../services/CodeService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class CodeInspectorTool extends BaseTool {
    name = "code_inspector";
    description = "Inspects the codebase structure and content. Can list files or search for patterns.";

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
                enum: ["list_files", "search_files"],
                description: "Action to perform."
            },
            path: { type: "string", description: "Directory to list (default: root) for list_files." },
            recursive: { type: "boolean", description: "Recursive list (default: true) for list_files." },
            pattern: { type: "string", description: "Regex pattern to search (for search_files)." }
        },
        required: ["action"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            action: z.enum(["list_files", "search_files"]),
            path: z.string().optional().default("."),
            recursive: z.boolean().optional().default(true),
            pattern: z.string().optional(),
        });

        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
            throw new Error(`Invalid arguments: ${parseResult.error.message}`);
        }

        const { action, path, recursive, pattern } = parseResult.data;

        if (action === "list_files") {
            const files = this.codeService.listFiles(path, recursive);
            return {
                content: [{
                    type: "text",
                    text: files.length > 500
                        ? files.slice(0, 500).join("\n") + `\n... (${files.length - 500} more truncated)`
                        : files.join("\n")
                }]
            };
        }

        if (action === "search_files") {
            if (!pattern) throw new Error("pattern is required for search_files");
            const matches = this.codeService.searchFiles(pattern);
            return {
                content: [{
                    type: "text",
                    text: matches.length === 0
                        ? "No matches found."
                        : matches.map(m => `${m.file} (L${m.line}): ${m.content}`).join("\n")
                }]
            };
        }

        return { content: [] };
    }
}
