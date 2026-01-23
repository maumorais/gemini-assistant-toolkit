import { BaseTool } from "./BaseTool.js";
import { KnowledgeService } from "../services/KnowledgeService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class KnowledgeTool extends BaseTool {
    name = "knowledge_retriever";
    description = "Searches docs/ and journal.md for specific keywords to answer architectural questions.";

    private knowledgeService: KnowledgeService;

    constructor() {
        super();
        this.knowledgeService = new KnowledgeService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            query: { type: "string", description: "Topic to search for (e.g. 'auth patterns', 'error handling')." }
        },
        required: ["query"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            query: z.string(),
        });
        const { query } = schema.parse(args);

        const results = this.knowledgeService.searchDocs(query);

        return {
            content: [{
                type: "text",
                text: results.join("\n---\n")
            }]
        };
    }
}
