import express from "express";
import cors from "cors";
import authRouter from "./auth.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRouter);

// This server exists for one reason: n8n's REST API doesn't send the
// Access-Control-Allow-Origin headers a browser needs, and an n8n API key
// should never live in frontend JS where anyone with devtools can read it.
// The React app calls this local proxy; the proxy (server-side, so CORS
// doesn't apply and the key never reaches the browser response) talks to
// the user's own n8n instance.
app.get("/api/n8n/status", async (_req, res) => {
  const baseUrl = (process.env.N8N_URL || "").replace(/\/$/, "");
  const apiKey = process.env.N8N_API_KEY;

  if (!baseUrl || !apiKey) {
    return res.json({ connected: false, configured: false, message: "n8n credentials are not configured in server/.env." });
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/workflows?limit=1`, {
      headers: { "X-N8N-API-KEY": apiKey },
    });
    if (!response.ok) {
      return res.json({ connected: false, configured: true, message: `n8n returned HTTP ${response.status}.` });
    }
    return res.json({ connected: true, configured: true, n8nUrl: baseUrl });
  } catch (err) {
    return res.json({ connected: false, configured: true, message: err.message || "Cannot reach n8n." });
  }
});

// Returns a compact copy of the node catalog from the connected n8n instance.
// n8n serves its complete node metadata at /types/nodes.json. We fetch it
// server-side so FlowArchitect can mirror the nodes actually installed in the
// user's n8n version without exposing the API key to the browser.
app.get("/api/n8n/nodes", async (_req, res) => {
  const baseUrl = (process.env.N8N_URL || "").replace(/\/$/, "");
  const apiKey = process.env.N8N_API_KEY;

  if (!baseUrl || !apiKey) {
    return res.status(503).json({
      error: "n8n is not configured. Add N8N_URL and N8N_API_KEY to server/.env and restart the backend.",
    });
  }

  try {
    const response = await fetch(`${baseUrl}/types/nodes.json`, {
      headers: { "X-N8N-API-KEY": apiKey },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Could not read the n8n node catalog (HTTP ${response.status}).`,
      });
    }

    const raw = await response.json();
    const nodes = Array.isArray(raw) ? raw.map((node) => ({
      name: node.name,
      displayName: node.displayName,
      version: node.version,
      defaultVersion: node.defaultVersion,
      description: node.description,
      subtitle: node.subtitle,
      group: node.group,
      icon: node.icon,
      codex: node.codex,
      credentials: node.credentials,
      properties: Array.isArray(node.properties)
        ? node.properties.map((p) => ({
            name: p.name,
            displayName: p.displayName,
            type: p.type,
            options: Array.isArray(p.options)
              ? p.options.slice(0, 30).map((o) => ({ name: o.name, value: o.value }))
              : undefined,
          }))
        : [],
    })) : [];

    return res.json({ total: nodes.length, nodes, n8nUrl: baseUrl });
  } catch (err) {
    return res.status(502).json({
      error: `Could not reach n8n at ${baseUrl}. ${err.message || "Check that n8n is running."}`,
    });
  }
});

// n8n credentials live only on the backend. The browser sends only the
// generated workflow, so an API key can never be exposed through React,
// localStorage, or browser devtools.
app.post("/api/n8n/deploy", async (req, res) => {
  const { workflow } = req.body || {};
  const baseUrl = (process.env.N8N_URL || "").replace(/\/$/, "");
  const apiKey = process.env.N8N_API_KEY;

  if (!baseUrl || !apiKey) {
    return res.status(503).json({
      error: "n8n is not configured. Add N8N_URL and N8N_API_KEY to server/.env and restart the backend.",
    });
  }

  if (!workflow || !Array.isArray(workflow.nodes)) {
    return res.status(400).json({ error: "A workflow with nodes is required." });
  }

  const headers = { "X-N8N-API-KEY": apiKey, "Content-Type": "application/json" };

  try {
    const createRes = await fetch(`${baseUrl}/api/v1/workflows`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: workflow.name || "FlowArchitect Workflow",
        nodes: workflow.nodes,
        connections: workflow.connections || {},
        settings: workflow.settings || { executionOrder: "v1" },
      }),
    });

    const createdText = await createRes.text();
    let created;
    try { created = JSON.parse(createdText); } catch { created = { message: createdText }; }

    if (!createRes.ok) {
      return res.status(createRes.status).json({ stage: "create", error: created });
    }

    const workflowId = created.id;
    const result = {
      stage: "created",
      workflowId,
      activated: false,
      n8nUrl: baseUrl,
      editorUrl: `${baseUrl}/workflow/${workflowId}`,
      executionDetail: "Workflow created in n8n. FlowArchitect does not auto-execute it; n8n will run it according to its configured trigger.",
    };

    // Activate the workflow so schedule/webhook triggers can run. We do not
    // call /run or a webhook here because automatic execution could send real
    // emails, modify data, or call external APIs unexpectedly.
    const activateRes = await fetch(`${baseUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: "POST",
      headers,
    });
    result.activated = activateRes.ok;

    if (!activateRes.ok) {
      result.executionDetail = "Workflow was created in n8n, but n8n did not activate it automatically. Open it in n8n and activate it after reviewing the nodes and credentials.";
    }

    return res.json(result);
  } catch (err) {
    return res.status(502).json({ error: `Could not reach n8n at ${baseUrl}. ${err.message || "Check that n8n is running."}` });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`FlowArchitect n8n proxy running on http://localhost:${PORT}`);
});
