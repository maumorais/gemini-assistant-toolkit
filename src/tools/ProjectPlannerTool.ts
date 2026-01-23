import { BaseTool } from "./BaseTool.js";
import { PlanningService } from "../services/PlanningService.js";
import { z } from "zod";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class ProjectPlannerTool extends BaseTool {
    name = "project_planner";
    description = "Manages project planning artifacts. Use this to create or update implementation plans and task lists BEFORE starting any coding work.";

    private planningService: PlanningService;

    constructor() {
        super();
        this.planningService = new PlanningService();
    }

    schema: Tool["inputSchema"] = {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["init_plan", "read_plan", "update_task", "archive_plan"],
                description: "Action to perform: 'init_plan' (new), 'read_plan' (check status), 'update_task' (mark progress), 'archive_plan' (save to history)."
            },
            goal: { type: "string", description: "Goal description (for init_plan)" },
            steps: {
                type: "array",
                items: { type: "string" },
                description: "List of high-level steps (for init_plan)"
            },
            step_index: { type: "number", description: "Zero-based index of the task to update (for update_task)" },
            status: { type: "string", enum: ["pending", "in_progress", "done"], description: "New status (for update_task)" },
            archive_label: { type: "string", description: "Label for the archived files (e.g. 'v1.0.0_feature_x') (for archive_plan)" }
        },
        required: ["action"],
    };

    async execute(args: any): Promise<any> {
        const schema = z.object({
            action: z.enum(["init_plan", "read_plan", "update_task", "archive_plan"]),
            goal: z.string().optional(),
            steps: z.array(z.string()).optional(),
            step_index: z.number().optional(),
            status: z.enum(["pending", "in_progress", "done"]).optional(),
            archive_label: z.string().optional(),
        });

        const parseResult = schema.safeParse(args);
        if (!parseResult.success) {
            throw new Error(`Invalid arguments: ${parseResult.error.message}`);
        }

        const { action, goal, steps, step_index, status, archive_label } = parseResult.data;

        let result = "";

        if (action === "init_plan") {
            if (!goal || !steps) throw new Error("init_plan requires 'goal' and 'steps'");
            result = await this.planningService.initPlan(goal, steps);
        } else if (action === "read_plan") {
            result = await this.planningService.readPlan();
        } else if (action === "update_task") {
            if (step_index === undefined || !status) throw new Error("update_task requires 'step_index' and 'status'");
            result = await this.planningService.updateTaskStatus(step_index, status);
        } else if (action === "archive_plan") {
            if (!archive_label) throw new Error("archive_plan requires 'archive_label'");
            result = await this.planningService.archiveCurrentPlan(archive_label);
        }

        return {
            content: [
                {
                    type: "text",
                    text: result,
                },
            ],
        };
    }
}
