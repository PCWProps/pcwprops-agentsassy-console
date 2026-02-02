const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const saasyCloud = require("../../systems/saasy-cloud");
const saasyMcp = require("../../systems/saasy-mcp");
const saasyAi = require("../../systems/saasy-ai");
const saasyTech = require("../../systems/saasy-tech");

const port = process.env.PORT ? Number(process.env.PORT) : 3030;
const uiRoot = path.join(__dirname, "ui");
const logsRoot = path.join(__dirname, "..", "..", "logs");
const orchestratorLog = path.join(logsRoot, "orchestrator.log");

fs.mkdirSync(logsRoot, { recursive: true });

const appendLog = (entry) => {
  const line = `${new Date().toISOString()} ${entry}\n`;
  fs.appendFile(orchestratorLog, line, () => {});
};

const jsonResponse = (res, status, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "content-type": "application/json",
    "content-length": Buffer.byteLength(body),
    "x-request-id": payload.requestId || payload.request_id || "req-local",
  });
  res.end(body);
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });

const serveStatic = (res, filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".pdf": "application/pdf",
  };
  const contentType = types[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": contentType });
    res.end(data);
  });
};

const server = http.createServer(async (req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || "/";

  if (pathname === "/api/health" && req.method === "GET") {
    appendLog(`health check`);
    return jsonResponse(res, 200, {
      status: "ok",
      time: new Date().toISOString(),
    });
  }

  if (pathname === "/api/control/request" && req.method === "POST") {
    try {
      const payload = await readBody(req);
      const controlRequest = saasyCloud.buildControlRequest(payload);
      const authContext = saasyCloud.validateAuth(controlRequest);
      const capabilities = saasyMcp.getCapabilities();
      const analysis = saasyAi.analyzeIntent(controlRequest, authContext, capabilities);
      const routingDecision = {
        decisionId: `decision-${Date.now()}`,
        requestId: controlRequest.requestId,
        routeType: analysis.recommendation.routeType,
        target: analysis.recommendation.target,
        reason: analysis.reason,
        requiredCapabilities: analysis.recommendation.requiredCapabilities,
        policyRef: analysis.recommendation.policyRef,
        issuedAt: new Date().toISOString(),
      };
      const executionResult = saasyTech.executeMock(routingDecision);

      appendLog(
        `control request ${controlRequest.requestId} route=${routingDecision.routeType} target=${routingDecision.target.system}`
      );
      return jsonResponse(res, 200, {
        requestId: controlRequest.requestId,
        status: "accepted",
        auth: authContext,
        capabilities,
        analysis,
        decision: routingDecision,
        result: executionResult,
        issuedAt: new Date().toISOString(),
      });
    } catch (error) {
      appendLog(`control request error ${error.message || "bad-request"}`);
      return jsonResponse(res, 400, {
        status: "error",
        error: {
          code: "bad-request",
          message: error.message || "Invalid request payload",
        },
        issuedAt: new Date().toISOString(),
      });
    }
  }

  if (pathname === "/" || pathname === "/index.html") {
    return serveStatic(res, path.join(uiRoot, "index.html"));
  }

  const staticPath = path.join(uiRoot, pathname.replace(/^\/+/, ""));
  if (staticPath.startsWith(uiRoot) && fs.existsSync(staticPath)) {
    return serveStatic(res, staticPath);
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`AgentSassy console running at http://localhost:${port}`);
});
