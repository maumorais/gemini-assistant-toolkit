import { ITool } from "../interfaces/ITool.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export abstract class BaseTool implements ITool {
    public abstract name: string;
    public abstract description: string;
    public abstract schema: Tool["inputSchema"];

    abstract execute(args: any): Promise<any>;

    getToolDefinition(): Tool {
        return {
            name: this.name,
            description: this.description,
            inputSchema: this.schema
        };
    }
}
