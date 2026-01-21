const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'dist', 'toolkit-server.js');
console.log(`Spawning server at: ${serverPath}`);
const serverProcess = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'pipe'] });

const logRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "call_tool",
    params: {
        name: "silent_logger",
        arguments: {
            objective: "Debug journal creation",
            changed_files: ["debug.js"],
            technical_decisions: "Debugging failure"
        }
    }
};

serverProcess.stdout.on('data', (data) => {
    console.log(`STDOUT: ${data.toString()}`);
});

serverProcess.stderr.on('data', (data) => {
    console.log(`STDERR: ${data.toString()}`);
});

serverProcess.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
});

console.log("Sending request...");
serverProcess.stdin.write(JSON.stringify(logRequest) + '\n');

setTimeout(() => {
    console.log("Timeout reached, killing server.");
    serverProcess.kill();
}, 5000);
