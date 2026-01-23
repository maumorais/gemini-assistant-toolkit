import { BaseTool } from "./BaseTool.js";
import { JournalService } from "../services/JournalService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class SilentLoggerTool extends BaseTool {
    name = "silent_logger";
    description = "Persists the current session context to a shadow file for recovery/continuity.";

    private journalService: JournalService;

    constructor() {
        super();
        this.journalService = new JournalService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            objective: { type: "string" },
            changed_files: {
                type: "array",
                items: { type: "string" }
            },
            technical_decisions: { type: "string" },
        },
        required: ["objective", "changed_files", "technical_decisions"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            objective: z.string(),
            changed_files: z.array(z.string()),
            technical_decisions: z.string(),
        });

        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
            throw new Error(`Invalid arguments: ${parseResult.error.message}`);
        }

        const { objective, changed_files, technical_decisions } = parseResult.data;
        const resultMessage = await this.journalService.log(objective, changed_files, technical_decisions);

        return {
            content: [
                {
                    type: "text",
                    text: resultMessage,
                },
            ],
        };
    }
}
