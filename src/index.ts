#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import { GitCommitTool } from "./tools/GitCommitTool.js";
import { SilentLoggerTool } from "./tools/SilentLoggerTool.js";
import { ProjectPlannerTool } from "./tools/ProjectPlannerTool.js";
import { ITool } from "./interfaces/ITool.js";

class ToolkitServer {
    private server: Server;
    private tools: ITool[];

    constructor() {
        this.server = new Server(
            {
                name: "gemini-assistant-toolkit",
                version: "1.2.0",
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.tools = [
            new GitCommitTool(),
            new SilentLoggerTool(),
            new ProjectPlannerTool()
        ];

        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.tools.map(tool => ({
                    name: tool.name,
                    description: tool.description,
                    inputSchema: tool.schema
                })),
            };
        });

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            const tool = this.tools.find(t => t.name === name);

            if (!tool) {
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
            }

            try {
                return await tool.execute(args);
            } catch (error: any) {
                return {
                    content: [{ type: "text", text: `Error: ${error.message}` }],
                    isError: true,
                };
            }
        });
    }

    public async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("Gemini Assistant Toolkit (OOP) running on stdio");
    }
}

const server = new ToolkitServer();
server.run().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
