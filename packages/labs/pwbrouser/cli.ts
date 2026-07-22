#!/usr/bin/env node
import { type ChildProcess, spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import http from "node:http";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runClient } from "./src/browser.js";

const PW_DIR = join(homedir(), ".pwbrouser");
const PID_FILE = join(PW_DIR, "pid");
const PORT_FILE = join(PW_DIR, "port");
const DEFAULT_PORT = 9999;

function ensureDir(): void {
  if (!existsSync(PW_DIR)) mkdirSync(PW_DIR, { recursive: true });
}

function readPid(): number | null {
  try {
    return Number(readFileSync(PID_FILE, "utf-8").trim());
  } catch {
    return null;
  }
}

function readPort(): number {
  try {
    return Number(readFileSync(PORT_FILE, "utf-8").trim()) || DEFAULT_PORT;
  } catch {
    return DEFAULT_PORT;
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function serverStart(args: string[]): Promise<void> {
  ensureDir();

  let port = DEFAULT_PORT;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--port" && args[i + 1]) {
      port = Number(args[++i]) || DEFAULT_PORT;
    }
  }

  const existingPid = readPid();
  if (existingPid && isProcessRunning(existingPid)) {
    const existingPort = readPort();
    console.log(`Server is already running on port ${existingPort} (PID: ${existingPid})`);
    process.exit(0);
  }

  const serverScript = join(dirname(fileURLToPath(import.meta.url)), "src", "server.js");
  const child: ChildProcess = spawn("node", [serverScript], {
    detached: true,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PWBROWSER_PORT: String(port) },
  });

  if (!child.pid) {
    console.error("Failed to start server.");
    process.exit(1);
  }

  let stderrOutput = "";
  child.stderr?.on("data", (chunk: Buffer) => {
    stderrOutput += chunk.toString();
  });

  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      child.stderr?.destroy();
      child.stdout?.destroy();
      resolve();
    }, 5000);

    child.on("exit", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderrOutput.trim() || `Server exited with code ${code}`));
      } else {
        resolve();
      }
    });
  });

  writeFileSync(PID_FILE, String(child.pid));
  writeFileSync(PORT_FILE, String(port));
  child.unref();

  console.log(`Server started on port ${port} (PID: ${child.pid})`);
}

function serverStop(): void {
  const pid = readPid();
  if (!pid) {
    console.log("Server is not running.");
    return;
  }

  if (!isProcessRunning(pid)) {
    console.log("Server is not running (stale PID file).");
    cleanupFiles();
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
    console.log(`Server stopped (PID: ${pid})`);
  } catch {
    console.error("Failed to stop server.");
  }

  cleanupFiles();
}

async function serverStatus(): Promise<void> {
  const pid = readPid();
  if (!pid || !isProcessRunning(pid)) {
    console.log("Server is stopped.");
    cleanupFiles();
    return;
  }

  const port = readPort();

  try {
    const info = await getServerStatus(port);
    console.log(`Server is running`);
    console.log(`  PID: ${pid}`);
    console.log(`  Port: ${port}`);
    console.log(`  Page: ${info.url || "no page loaded"}`);
  } catch {
    console.log(`Server is running (PID: ${pid}, Port: ${port})`);
    console.log("  (could not fetch page status)");
  }
}

function getServerStatus(port: number): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://127.0.0.1:${port}/status`, { timeout: 3000 }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data) as { url: string });
        } catch {
          reject(new Error("Invalid response"));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

function cleanupFiles(): void {
  try {
    unlinkSync(PID_FILE);
  } catch {
    /* ignore */
  }
  try {
    unlinkSync(PORT_FILE);
  } catch {
    /* ignore */
  }
}

function showHelp(): void {
  console.log(`pwbrouser — Playwright browser automation CLI

Commands:
  pwbrouser server start [--port PORT]   Start the browser daemon
  pwbrouser server stop                  Stop the browser daemon
  pwbrouser server status                Show daemon status (port, current page)
  pwbrouser <action> [args...]           Execute a browser action
  pwbrouser --help                       Show this help
  pwbrouser --version                    Show version`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    showHelp();
    process.exit(0);
  }

  if (args[0] === "--version") {
    const pkg = JSON.parse(
      readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "package.json"), "utf-8"),
    ) as { version: string };
    console.log(pkg.version);
    process.exit(0);
  }

  if (args[0] === "server") {
    const subcommand = args[1];
    const rest = args.slice(2);

    switch (subcommand) {
      case "start":
        await serverStart(rest);
        break;
      case "stop":
        serverStop();
        break;
      case "status":
        await serverStatus();
        break;
      default:
        console.log(`Unknown server command: ${subcommand ?? "(none)"}`);
        console.log("Usage: pwbrouser server <start|stop|status> [--port PORT]");
        process.exit(1);
    }
    return;
  }

  const port = readPort();

  try {
    await runClient(args, port);
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
