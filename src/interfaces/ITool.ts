import { Tool } from "@modelcontextprotocol/sdk/types.js";

export interface ITool {
    name: string;
    description: string;
    schema: Tool["inputSchema"];
    execute(args: any): Promise<any>;
}
