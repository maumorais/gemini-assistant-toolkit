import { BaseTool } from "./BaseTool.js";
import { KnowledgeService } from "../services/KnowledgeService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class ContextTool extends BaseTool {
    name = "context_map";
    description = "Generates a high-level summary of the project structure and key files to ground the agent.";

    private knowledgeService: KnowledgeService;

    constructor() {
        super();
        this.knowledgeService = new KnowledgeService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            action: { type: "string", enum: ["get_map"], description: "Action to perform." }
        },
        required: ["action"],
    };

    async execute(args: any): Promise<any> {
        return {
            content: [{
                type: "text",
                text: this.knowledgeService.getProjectMap()
            }]
        };
    }
}
