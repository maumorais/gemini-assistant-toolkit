import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, "../dist/index.js");

async function main() {
    console.log("Starting server process at:", serverPath);

    const transport = new StdioClientTransport({
        command: "node",
        args: [serverPath],
    });

    const client = new Client(
        { name: "debug-client", version: "1.0.0" },
        { capabilities: {} }
    );

    try {
        console.log("Connecting...");
        await client.connect(transport);
        console.log("Connected!");

        console.log("Listing tools...");
        const result = await client.listTools();
        console.log("Tools found:", JSON.stringify(result, null, 2));

    } catch (error) {
        console.error("Error:", error);
    } finally {
        // We can't easily close gracefully without a proper cleanup, 
        // but the script exit will kill the child process (usually).
        process.exit(0);
    }
}

main();
