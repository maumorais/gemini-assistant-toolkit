const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'dist', 'toolkit-server.js');
const CONCURRENT_REQUESTS = 5;

console.log(`Starting stress test with ${CONCURRENT_REQUESTS} concurrent requests...`);

function runRequest(id) {
    return new Promise((resolve, reject) => {
        const proc = spawn('node', [serverPath], { stdio: ['pipe', 'pipe', 'pipe'] });
        let stdout = '';
        let stderr = '';

        const payload = {
            jsonrpc: "2.0",
            id: id,
            method: "tools/call",
            params: {
                name: "silent_logger",
                arguments: {
                    objective: `Stress Test Request ${id}`,
                    changed_files: [`stress_${id}.txt`],
                    technical_decisions: "Testing Lock Mechanism"
                }
            }
        };

        proc.stdout.on('data', (d) => stdout += d.toString());
        proc.stderr.on('data', (d) => stderr += d.toString());

        proc.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Exit code ${code}. Stderr: ${stderr}`));
            } else if (stdout.includes("Journal entry appended")) {
                resolve(`Req ${id}: Success`);
            } else {
                reject(new Error(`Req ${id} Failed. Stdout: ${stdout}`));
            }
        });

        proc.stdin.write(JSON.stringify(payload) + '\n');
    });
}

async function run() {
    const promises = [];
    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        promises.push(runRequest(i));
    }

    try {
        const results = await Promise.all(promises);
        console.log("All requests completed successfully:");
        results.forEach(r => console.log(r));
        process.exit(0);
    } catch (error) {
        console.error("Stress Test Failed:", error);
        process.exit(1);
    }
}

run();
