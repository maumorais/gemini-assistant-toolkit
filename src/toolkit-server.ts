#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import simpleGit from "simple-git";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const git = simpleGit();

const server = new Server(
    {
        name: "gemini-assistant-toolkit",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// --- Helpers ---
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function acquireLock(lockPath: string, retries = 50, delay = 100): Promise<void> {
    for (let i = 0; i < retries; i++) {
        try {
            // 'wx' flag ensures atomic creation. Fails if exists.
            const fd = fs.openSync(lockPath, 'wx');
            fs.closeSync(fd);
            return;
        } catch (error: any) {
            if (error.code === 'EEXIST') {
                await sleep(delay);
                continue;
            }
            throw error;
        }
    }
    throw new Error(`Could not acquire lock on ${lockPath} after ${retries} attempts.`);
}

function releaseLock(lockPath: string) {
    try {
        fs.unlinkSync(lockPath);
    } catch (error) {
        // Ignore if already gone
    }
}

// --- Schemas ---

const GitCommitAgentSchema = z.object({
    commit_message: z.string().describe("The commit message to use. The Agent (Gemini) MUST have already analyzed the diff and proposed this message in Conventional Commits format."),
});

const SilentLoggerSchema = z.object({
    objective: z.string().describe("Current user objective."),
    changed_files: z.array(z.string()).describe("List of files modified in this step/context."),
    technical_decisions: z.string().describe("Summary of technical decisions made."),
});

// --- Tools Implementation ---

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "git_commit_agent",
                description: "Executor for Git operations. Performs 'git add .' and 'git commit'. LOGIC: The thinking happens BEFORE calling this. This tool just executes.",
                inputSchema: {
                    type: "object",
                    properties: {
                        commit_message: {
                            type: "string",
                            description: "The commit message (Conventional Commits).",
                        },
                    },
                    required: ["commit_message"],
                },
            },
            {
                name: "silent_logger",
                description: "Persists the current session context to a shadow file for recovery/continuity.",
                inputSchema: {
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
                },
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // --- Tool: git_commit_agent ---
    if (name === "git_commit_agent") {
        const parseResult = GitCommitAgentSchema.safeParse(args);
        if (!parseResult.success) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid arguments: ${parseResult.error.message}`);
        }
        const { commit_message } = parseResult.data;

        try {
            // Safety Check: Detect Merge Conflicts
            const status = await git.status();
            if (status.conflicted.length > 0) {
                throw new Error(`Merge conflicts detected in: ${status.conflicted.join(', ')}. Resolve them before committing.`);
            }

            // Logic: Zero-cost executor. "Add all" + "Commit"
            await git.add(".");
            const commitResult = await git.commit(commit_message);

            return {
                content: [
                    {
                        type: "text",
                        text: `Git Operation Successful.\nExecuted: git add . && git commit -m "${commit_message}"\nBranch: ${commitResult.branch}\nCommit: ${commitResult.commit}`,
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Git Error: ${error.message}` }],
                isError: true,
            };
        }
    }

    // --- Tool: silent_logger ---
    if (name === "silent_logger") {
        const parseResult = SilentLoggerSchema.safeParse(args);
        if (!parseResult.success) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid arguments: ${parseResult.error.message}`);
        }
        const { objective, changed_files, technical_decisions } = parseResult.data;

        try {
            const projectRoot = process.cwd();
            const docsDir = path.join(projectRoot, "docs");
            const journalFile = path.join(docsDir, "journal.md");
            const lockFile = path.join(docsDir, "journal.lock");

            if (!fs.existsSync(docsDir)) {
                fs.mkdirSync(docsDir, { recursive: true });
            }

            const timestamp = new Date().toISOString();
            const entryHash = Math.random().toString(36).substring(7);

            // Logic: Read - Modify State - Append History - Write

            const markerStart = "<!-- STATE_START -->";
            const markerEnd = "<!-- STATE_END -->";

            const newStateBlock = `
${markerStart}
## Consolidated State
**Last Update:** ${timestamp}
**Current Objective:**
${objective}

**Technical Context & Decisions:**
${technical_decisions}
${markerEnd}
`;

            const newHistoryEntry = `
### Entry [${entryHash}] - ${timestamp}
- **Files**: ${changed_files.join(', ') || 'None'}
- **Summary**: ${technical_decisions}
---
`;

            // CRITICAL: Acquire Lock for RMW cycle
            await acquireLock(lockFile);
            try {
                let currentContent = "";
                if (fs.existsSync(journalFile)) {
                    currentContent = fs.readFileSync(journalFile, 'utf8');
                }

                let finalContent = "";

                if (currentContent.includes(markerStart) && currentContent.includes(markerEnd)) {
                    // Update existing state block
                    const preState = currentContent.substring(0, currentContent.indexOf(markerStart));
                    const postState = currentContent.substring(currentContent.indexOf(markerEnd) + markerEnd.length);

                    finalContent = preState + newStateBlock + postState + newHistoryEntry;
                } else {
                    // Initialize structure or migrate
                    const oldHistory = currentContent.replace(/^# Project Journal\s+/, ""); // Remove header if exists to avoid dup
                    finalContent = `# Project Journal\n${newStateBlock}\n\n## History\n\n${oldHistory}\n${newHistoryEntry}`;
                }

                fs.writeFileSync(journalFile, finalContent);
            } finally {
                releaseLock(lockFile);
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Journal updated with new Consolidated State and History entry.`,
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Logger Error: ${error.message}` }],
                isError: true,
            };
        }
    }

    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
});

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Gemini Assistant Toolkit running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});
