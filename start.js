#!/usr/bin/env node

/**
 * Smart Start Script for UI5 Splash Screen POC
 *
 * Features:
 * - Checks if port is in use
 * - Kills existing process if it belongs to this project
 * - Prevents killing unrelated processes
 * - Starts fiori run with optional config file
 *
 * Usage:
 *   node start.js                    # Default (ui5.yaml)
 *   node start.js ui5-backend.yaml   # With backend proxy config
 */

const { execSync, spawn } = require('child_process');
const path = require('path');

// Configuration
const rawPort = process.env.PORT || '8300';
const DEFAULT_PORT = parseInt(rawPort, 10);

// Validate port to prevent command injection
if (isNaN(DEFAULT_PORT) || DEFAULT_PORT < 1 || DEFAULT_PORT > 65535) {
    console.error(`❌ Invalid PORT: ${rawPort}`);
    console.error('   PORT must be a number between 1 and 65535');
    console.error('   Examples: PORT=8300, PORT=9000');
    process.exit(1);
}

const PROJECT_MARKER = 'ui5-splash-screen-poc';
const configFile = process.argv[2]; // Optional: yaml config file path

console.log(`🚀 Smart Start`);
console.log(`   Port: ${DEFAULT_PORT}`);
console.log(`   Project: ${PROJECT_MARKER}`);
if (configFile) {
    console.log(`   Config: ${configFile}`);
}
console.log('');

/**
 * Check if port is in use and get PID
 */
function getPortPID(port) {
    try {
        let cmd;
        if (process.platform === 'win32') {
            cmd = `netstat -ano | findstr :${port}`;
        } else {
            cmd = `lsof -ti:${port} -sTCP:LISTEN`;
        }

        const output = execSync(cmd, { encoding: 'utf8' });

        if (process.platform === 'win32') {
            const lines = output.trim().split('\n');
            for (const line of lines) {
                const match = line.match(/LISTENING\s+(\d+)/);
                if (match) {
                    return match[1];
                }
            }
            return null;
        } else {
            return output.trim().split('\n')[0];
        }
    } catch (error) {
        return null;
    }
}

/**
 * Check if process belongs to this project
 */
function isProjectProcess(pid) {
    try {
        let cmd;
        if (process.platform === 'win32') {
            cmd = `wmic process where "ProcessId=${pid}" get CommandLine /format:list`;
        } else {
            cmd = `ps -p ${pid} -o command=`;
        }

        const cmdLine = execSync(cmd, { encoding: 'utf8' });

        return cmdLine.includes(PROJECT_MARKER) ||
               cmdLine.includes('fiori') ||
               cmdLine.includes('ui5 serve');
    } catch (error) {
        return false;
    }
}

/**
 * Kill process by PID
 */
function killProcess(pid) {
    try {
        console.log(`🔄 Killing existing process (PID: ${pid})...`);
        if (process.platform === 'win32') {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
        } else {
            execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
        }
        console.log(`✅ Process killed successfully\n`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to kill process: ${error.message}`);
        return false;
    }
}

/**
 * Main logic
 */
function main() {
    // 1. Check if port is in use
    const pid = getPortPID(DEFAULT_PORT);

    if (pid) {
        console.log(`⚠️  Port ${DEFAULT_PORT} is already in use (PID: ${pid})`);

        if (isProjectProcess(pid)) {
            console.log(`✓  Process belongs to this project (${PROJECT_MARKER})`);

            if (!killProcess(pid)) {
                console.error(`❌ Could not kill process. Please stop it manually.`);
                process.exit(1);
            }

            console.log(`⏳ Waiting for port to be released...`);
            const start = Date.now();
            while (Date.now() - start < 3000) {
                if (!getPortPID(DEFAULT_PORT)) {
                    break;
                }
            }
            console.log(`✅ Port ${DEFAULT_PORT} is now free\n`);
        } else {
            console.error(`❌ Port ${DEFAULT_PORT} is used by another application (PID: ${pid})`);
            console.error(`   This process does NOT belong to ${PROJECT_MARKER}`);
            console.error(`   Please stop it manually or use a different port:`);
            console.error(`   PORT=9000 npm run smart-start`);
            process.exit(1);
        }
    } else {
        console.log(`✓  Port ${DEFAULT_PORT} is available\n`);
    }

    // 2. Start fiori run
    console.log(`🚀 Starting fiori run...\n`);

    const args = ['fiori', 'run', '--port', DEFAULT_PORT.toString(), '--open', 'index.html'];
    if (configFile) {
        args.push('--config', configFile);
    }

    const server = spawn('npx', args, {
        stdio: 'inherit',
        env: {
            ...process.env,
            UI5_SPLASH_PROJECT: PROJECT_MARKER,
            PORT: DEFAULT_PORT.toString()
        }
    });

    server.on('error', (error) => {
        console.error(`❌ Failed to start server: ${error.message}`);
        process.exit(1);
    });

    server.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Server exited with code ${code}`);
            process.exit(code);
        }
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log(`\n\n👋 Stopping server...`);
        server.kill('SIGINT');
        process.exit(0);
    });
}

// Run
main();
