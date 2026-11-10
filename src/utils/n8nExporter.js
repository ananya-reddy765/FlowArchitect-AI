import { nodeDefinitions } from "../data/nodeDefinitions";
// Stage 5 (n8n Integration). Maps FlowArchitect's internal node types onto
// real n8n node type strings + typeVersion, and produces a workflow JSON
// in n8n's actual import format: { name, nodes, connections, ... }.
// n8n reads pasted-in clipboard JSON in exactly this shape (it's what n8n
// itself produces when you copy nodes on its canvas), so this file can be
// pasted straight onto an n8n canvas or imported via File > Import from File.

const N8N_TYPE_MAP = {
  "manual-trigger": { type: "n8n-nodes-base.manualTrigger", typeVersion: 1 },
  schedule: { type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1.2 },
  webhook: { type: "n8n-nodes-base.webhook", typeVersion: 2 },
  "form-submission": { type: "n8n-nodes-base.formTrigger", typeVersion: 2.2 },
  "gmail-trigger": { type: "n8n-nodes-base.gmailTrigger", typeVersion: 1.2 },

  gmail: { type: "n8n-nodes-base.gmail", typeVersion: 2.1 },
  email: { type: "n8n-nodes-base.emailSend", typeVersion: 2.1 },
  "send-email": { type: "n8n-nodes-base.emailSend", typeVersion: 2.1 },
  slack: { type: "n8n-nodes-base.slack", typeVersion: 2.2 },
  "slack-notification": { type: "n8n-nodes-base.slack", typeVersion: 2.2 },
  discord: { type: "n8n-nodes-base.discord", typeVersion: 2 },
  teams: { type: "n8n-nodes-base.microsoftTeams", typeVersion: 2 },

  "google-sheets": { type: "n8n-nodes-base.googleSheets", typeVersion: 4.5 },
  excel: { type: "n8n-nodes-base.microsoftExcel", typeVersion: 2.1 },
  postgresql: { type: "n8n-nodes-base.postgres", typeVersion: 2.5 },
  mysql: { type: "n8n-nodes-base.mySql", typeVersion: 2.4 },

  "google-drive": { type: "n8n-nodes-base.googleDrive", typeVersion: 3 },
  dropbox: { type: "n8n-nodes-base.dropbox", typeVersion: 1 },

  "http-request": { type: "n8n-nodes-base.httpRequest", typeVersion: 4.2 },
  "rest-api": { type: "n8n-nodes-base.httpRequest", typeVersion: 4.2 },

  if: { type: "n8n-nodes-base.if", typeVersion: 2.2 },
  switch: { type: "n8n-nodes-base.switch", typeVersion: 3.2 },
  filter: { type: "n8n-nodes-base.filter", typeVersion: 2.2 },
  merge: { type: "n8n-nodes-base.merge", typeVersion: 3.2 },

  "edit-fields": { type: "n8n-nodes-base.set", typeVersion: 3.4 },
  json: { type: "n8n-nodes-base.set", typeVersion: 3.4 },
  "transform-data": { type: "n8n-nodes-base.set", typeVersion: 3.4 },
  code: { type: "n8n-nodes-base.code", typeVersion: 2 },

  openai: { type: "n8n-nodes-base.openAi", typeVersion: 1.8 },
  gemini: { type: "n8n-nodes-base.googleGemini", typeVersion: 1 },
  "ai-agent": { type: "@n8n/n8n-nodes-langchain.agent", typeVersion: 1.9 },
  "text-summarizer": { type: "n8n-nodes-base.openAi", typeVersion: 1.8 },
  "text-classifier": { type: "n8n-nodes-base.openAi", typeVersion: 1.8 },

  wait: { type: "n8n-nodes-base.wait", typeVersion: 1.1 },
  delay: { type: "n8n-nodes-base.wait", typeVersion: 1.1 },
  "date-time": { type: "n8n-nodes-base.dateTime", typeVersion: 2 },
  loop: { type: "n8n-nodes-base.splitInBatches", typeVersion: 3 },

  "webhook-response": { type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.4 },
  "export-json": { type: "n8n-nodes-base.set", typeVersion: 3.4 },
};

function buildParameters(nodeType, config = {}) {
  switch (nodeType) {
    case "schedule":
      return { rule: { interval: [{ field: "days" }] }, notes: config.frequency || undefined };
    case "webhook":
      return { path: config.path || "flowarchitect-webhook", httpMethod: "POST" };
    case "gmail-trigger":
      return { simple: true, filters: { q: config.filters || "" } };
    case "send-email":
    case "email":
      return { toEmail: config.to || "", subject: config.notes || "", message: "" };
    case "gmail":
      return { sendTo: config.to || "", subject: config.notes || "", message: "" };
    case "slack":
    case "slack-notification":
      return { select: "channel", channelId: { value: config.channel || "", mode: "name" }, text: config.message || "" };
    case "discord":
      return { channelId: config.channel || "", content: "" };
    case "google-sheets":
      return {
        operation: config.operation || "append",
        documentId: { value: config.spreadsheet || "" },
        sheetName: { value: config.sheet || "" },
      };
    case "postgresql":
    case "mysql":
      return { operation: "executeQuery", query: config.query || "" };
    case "google-drive":
      return { operation: "upload", folderId: { value: config.folder || "" } };
    case "http-request":
    case "rest-api":
      return { method: config.method || "GET", url: config.url || "" };
    case "if":
      return {
        conditions: {
          options: { caseSensitive: true, leftValue: "", typeValidation: "loose" },
          conditions: [
            {
              leftValue: config.condition || "",
              rightValue: config.value || "",
              operator: { type: "string", operation: "equals" },
            },
          ],
        },
      };
    case "code":
      return { jsCode: config.snippet || "// Add your logic here\nreturn items;" };
    case "ai-agent":
      return {
        promptType: "define",
        text: config.instructions || config.prompt || "Process the incoming data and return a useful result.",
        options: {},
      };
    case "openai":
    case "text-summarizer":
    case "text-classifier":
      return { resource: "chat", prompt: config.instructions || config.prompt || "" };
    case "wait":
    case "delay":
      return { amount: config.duration || 1, unit: "seconds" };
    default:
      return { ...config };
  }
}

function getRegisteredN8nNodeByLabel(label) {
  const target = String(label || "").trim().toLowerCase();
  return Object.values(nodeDefinitions).find(
    (def) => String(def?.label || "").trim().toLowerCase() === target && def?.n8n?.type
  );
}

function isChatModelType(type = "") {
  return /lmChat|chatModel/i.test(String(type));
}

function safeName(label, usedNames) {
  let name = label;
  let i = 2;
  while (usedNames.has(name)) {
    name = `${label} ${i}`;
    i += 1;
  }
  usedNames.add(name);
  return name;
}

// Converts FlowArchitect's { nodes, edges } canvas graph into a genuine
// n8n workflow object, ready to paste (Ctrl+V) onto an open n8n canvas
// or import via the n8n editor's File > Import from File.
export function convertToN8nWorkflow({ nodes, edges }, workflowName = "FlowArchitect Workflow") {
  const usedNames = new Set();
  const idToName = {};

  const n8nNodes = nodes.map((node, index) => {
    const registered = nodeDefinitions[node.data.nodeType]?.n8n;
    const mapping = registered?.type
      ? { type: registered.type, typeVersion: registered.typeVersion || 1 }
      : N8N_TYPE_MAP[node.data.nodeType] || {
          type: "n8n-nodes-base.noOp",
          typeVersion: 1,
        };
    const name = safeName(node.data.label, usedNames);
    idToName[node.id] = name;

    return {
      id: node.id,
      name,
      type: mapping.type,
      typeVersion: mapping.typeVersion,
      position: [index * 280, (node.position?.y ?? 120) - 120 || 0],
      parameters: buildParameters(node.data.nodeType, node.data.config || {}),
    };
  });

  const connections = {};
  (edges || []).forEach((edge) => {
    const sourceName = idToName[edge.source];
    const targetName = idToName[edge.target];
    if (!sourceName || !targetName) return;

    const outputIndex = edge.sourceHandle === "false" ? 1 : 0;

    if (!connections[sourceName]) connections[sourceName] = { main: [] };
    while (connections[sourceName].main.length <= outputIndex) {
      connections[sourceName].main.push([]);
    }
    connections[sourceName].main[outputIndex].push({
      node: targetName,
      type: "main",
      index: 0,
    });
  });

  // n8n AI Agent nodes require an AI language-model sub-node. FlowArchitect
  // automatically adds one when the blueprint contains an AI Agent but no
  // chat-model node. This keeps the existing canvas/UI unchanged while making
  // the compiled n8n workflow structurally complete.
  const existingChatModel = n8nNodes.find((node) => isChatModelType(node.type));
  const aiAgents = n8nNodes.filter((node) => /n8n-nodes-langchain\.agent$/i.test(node.type));

  if (aiAgents.length > 0 && !existingChatModel) {
    const syncedModel =
      getRegisteredN8nNodeByLabel("OpenAI Chat Model") ||
      getRegisteredN8nNodeByLabel("OpenAI Chat Model (Legacy)");
    const modelMapping = syncedModel?.n8n?.type
      ? {
          type: syncedModel.n8n.type,
          typeVersion: syncedModel.n8n.typeVersion || 1,
        }
      : {
          type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
          typeVersion: 1.2,
        };

    aiAgents.forEach((agent, agentIndex) => {
      const modelName = safeName(
        aiAgents.length === 1 ? "OpenAI Chat Model" : `OpenAI Chat Model ${agentIndex + 1}`,
        usedNames
      );
      const modelNode = {
        id: `flowarchitect-chat-model-${agentIndex + 1}`,
        name: modelName,
        type: modelMapping.type,
        typeVersion: modelMapping.typeVersion,
        position: [agent.position[0], agent.position[1] + 220],
        parameters: { options: {} },
      };
      n8nNodes.push(modelNode);
      connections[modelName] = {
        ai_languageModel: [[{ node: agent.name, type: "ai_languageModel", index: 0 }]],
      };
    });
  }

  return {
    name: workflowName,
    nodes: n8nNodes,
    connections,
    active: false,
    settings: { executionOrder: "v1" },
    meta: { instanceId: "flowarchitect-ai-generated" },
  };
}
