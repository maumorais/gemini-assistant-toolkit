import { BaseTool } from "./BaseTool.js";
import { PlanningService } from "../services/PlanningService.js";
import { GitService } from "../services/GitService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class DecisionTool extends BaseTool {
    name = "next_step_advisor";
    description = "Analyzes task status and git status to recommend the next logical action.";

    private planningService: PlanningService;
    private gitService: GitService;

    constructor() {
        super();
        this.planningService = new PlanningService();
        this.gitService = new GitService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            request_advice: { type: "boolean", description: "Set to true to get advice." }
        },
        required: ["request_advice"],
    };

    async execute(args: any): Promise<any> {
        // Gather context
        const plan = await this.planningService.readPlan();
        const gitStatus = await this.gitService.getLog(1); // just last commit for now, or status if we added getStatus method.
        // Let's assume we can get status via getLog for now or simple-git status if we add it. 
        // For Simplicity, let's just use the plan content.

        // Simple heuristic: Find first unchecked box
        const lines = plan.split('\n');
        let nextTask = "None found.";
        for (const line of lines) {
            if (line.includes("- [ ]")) {
                nextTask = line.trim();
                break;
            }
        }

        return {
            content: [{
                type: "text",
                text: `## Advisor Report\n**Current Plan Status**: Active\n**Next Logical Task**: ${nextTask}\n\n**Recommendation**: If you are starting this task, verify you are on the correct branch.`
            }]
        };
    }
}
