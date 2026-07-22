import http from "node:http";
import { type Browser, type BrowserContext, chromium, type Dialog, type FileChooser, type Page } from "playwright";
import { coreMethods } from "./core.js";
import { networkMethods, type RouteConfig } from "./network.js";
import { readonlyMethods } from "./readonly.js";
import { storageMethods } from "./storage.js";
import type { ConsoleMessageEntry, ExecuteRequest, ExecuteResponse, NetworkRequestEntry } from "./types.js";

const PORT = Number(process.env.PWBROWSER_PORT) || 9999;

let browser: Browser;
let context: BrowserContext;
let page: Page;
let pendingDialog: Dialog | null = null;
let pendingFileChooser: FileChooser | null = null;
const consoleMessages: ConsoleMessageEntry[] = [];
const networkRequests: NetworkRequestEntry[] = [];
const routes = new Map<string, RouteConfig>();
let requestIndex = 0;
let navIndex = 0;

type AnyHandler = (ctx: Record<string, unknown>, params: Record<string, unknown>) => Promise<Record<string, unknown>>;

const allMethods: Record<string, AnyHandler> = {
  ...coreMethods,
  ...readonlyMethods,
  ...storageMethods,
  ...networkMethods,
} as unknown as Record<string, AnyHandler>;

const NAV_METHODS = new Set(["browser_navigate", "browser_navigate_back", "browser_close"]);

async function initBrowser(): Promise<void> {
  try {
    browser = await chromium.launch({
      headless: false,
      args: ["--disable-blink-features=AutomationControlled", "--no-sandbox"],
    });
  } catch (error) {
    console.error(`[Daemon Error] Failed to launch browser: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
  
  context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 720 },
  });
  page = await context.newPage();

  page.on("dialog", (dialog) => {
    pendingDialog = dialog;
  });

  page.on("console", (msg) => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: Date.now(),
    });
  });

  page.on("request", (req) => {
    requestIndex++;
    networkRequests.push({
      index: requestIndex,
      url: req.url(),
      method: req.method(),
      status: 0,
      statusText: "",
      type: req.resourceType(),
      _request: req,
      _response: null,
    });
  });

  page.on("response", (resp) => {
    const reqUrl = resp.url();
    for (let i = networkRequests.length - 1; i >= 0; i--) {
      const r = networkRequests[i]!;
      if (r.url === reqUrl && r.status === 0) {
        r.status = resp.status();
        r.statusText = resp.statusText();
        r._response = resp;
        return;
      }
    }
  });

  startFileChooserWait();

  console.log("[Daemon] Playwright browser initialized and ready.");
}

function startFileChooserWait(): void {
  page
    .waitForEvent("filechooser", { timeout: 0 })
    .then((fc) => {
      pendingFileChooser = fc;
    })
    .catch(() => {});
}

function resetNavMarker(): void {
  navIndex = consoleMessages.length;
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.method === "GET" && req.url === "/status") {
    res.statusCode = 200;
    res.end(JSON.stringify({ running: true, port: PORT, url: page?.url() ?? "" }));
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", async () => {
    try {
      const { method, params = {} } = JSON.parse(body) as ExecuteRequest;
      console.log(`[Daemon] Executing: ${method}`);

      const handler = allMethods[method];
      if (!handler) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: { message: `Unknown method: ${method}` } }));
        return;
      }

      if (NAV_METHODS.has(method)) {
        resetNavMarker();
      }

      const methodCtx: Record<string, unknown> = {
        page,
        context,
        routes,
        pendingDialog,
        pendingFileChooser,
        consoleMessages,
        networkRequests,
        navIndex,
      };

      const result = await handler(methodCtx, params ?? {});

      if (methodCtx.page !== page) {
        page = methodCtx.page as Page;
      }

      pendingDialog = null;
      if (pendingFileChooser === null) {
        startFileChooserWait();
      }
      pendingFileChooser = null;

      const response: ExecuteResponse = { result };
      res.statusCode = 200;
      res.end(JSON.stringify(response));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[Daemon Error] ${message}`);

      let snapshot: string | undefined;
      try {
        snapshot =
          (await (page.ariaSnapshot as (opts?: { ref?: boolean }) => Promise<string | null>)({ ref: true })) ??
          undefined;
      } catch {
        /* ignore */
      }

      res.statusCode = 500;
      const response: ExecuteResponse = { error: { message, snapshot } };
      res.end(JSON.stringify(response));
    }
  });
});

initBrowser().then(() => {
  server.listen(PORT, "127.0.0.1", () => {
    console.log(`[Daemon] Socket server listening on http://127.0.0.1:${PORT}`);
  });
});
