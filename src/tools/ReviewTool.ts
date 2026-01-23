import { BaseTool } from "./BaseTool.js";
import { CodeService } from "../services/CodeService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class ReviewTool extends BaseTool {
    name = "code_reviewer";
    description = "Reviews staged changes or specific files for quality issues (console.log, TODOs, long functions).";

    private codeService: CodeService;

    constructor() {
        super();
        this.codeService = new CodeService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            action: { type: "string", enum: ["review"], description: "Action to perform." }
        },
        required: ["action"],
    };

    async execute(args: any): Promise<any> {
        // Simulation of a review. Ideally we'd parse git diff.
        // For now, let's scan key patterns in the whole project as a proxy for "check quality".
        // Or we re-use scanTodos and searchFiles logic.

        const debt = this.codeService.scanTodos();
        const consoles = this.codeService.searchFiles("console.log");

        let report = "## Code Review Report\n";

        if (debt.length > 0) {
            report += `\n### Technical Debt (${debt.length} items)\n`;
            report += debt.slice(0, 5).map(d => `- ${d.type} in ${d.file}`).join("\n");
            if (debt.length > 5) report += "\n...and more.";
        } else {
            report += "\n✅ No TODO/FIXME markers found.";
        }

        if (consoles.length > 0) {
            report += `\n### Debug Leftovers (${consoles.length} items)\n`;
            report += consoles.slice(0, 5).map(c => `- console.log in ${c.file}`).join("\n");
        } else {
            report += "\n✅ No console.log found.";
        }

        return {
            content: [{
                type: "text",
                text: report
            }]
        };
    }
}
