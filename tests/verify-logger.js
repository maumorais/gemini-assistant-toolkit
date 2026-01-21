const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverPath = path.join(__dirname, '..', 'dist', 'toolkit-server.js');
const serverProcess = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'pipe'] });

const logRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        name: "silent_logger",
        arguments: {
            objective: "Verify journal creation",
            changed_files: ["src/toolkit-server.ts", "GEMINI.md"],
            technical_decisions: "Refactored to use local docs/journal.md"
        }
    }
};

let output = '';

serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    if (output.includes('"result"')) {
        console.log("Received response from server.");
        serverProcess.kill();
    }
});

serverProcess.stderr.on('data', (data) => {
    console.error(`Server Error: ${data}`);
});

serverProcess.on('close', (code) => {
    // Verify file creation
    const journalFile = path.join(__dirname, '..', 'docs', 'journal.md');
    if (fs.existsSync(journalFile)) {
        console.log("SUCCESS: docs/journal.md created/found.");
        const content = fs.readFileSync(journalFile, 'utf8');
        console.log("Content Preview:\n", content.substring(0, 500));
        if (content.includes("Verify journal creation")) {
            console.log("SUCCESS: Content verification passed.");
        } else {
            console.error("FAILURE: Content verification failed.");
        }
    } else {
        console.error("FAILURE: docs/journal.md not found.");
    }
});

// Send request
serverProcess.stdin.write(JSON.stringify(logRequest) + '\n');
