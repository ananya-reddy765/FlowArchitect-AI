import {
  Bot,
  Boxes,
  Braces,
  Calendar,
  Cloud,
  Code2,
  Database,
  FileSpreadsheet,
  FileText,
  Globe,
  HardDrive,
  Mail,
  MessageSquare,
  Play,
  Sparkles,
  Webhook,
  Workflow,
} from "lucide-react";
import { nodeDefinitions } from "./nodeDefinitions";

// Runtime registry for the actual nodes installed in the connected n8n instance.
// It intentionally augments the existing FlowArchitect library instead of
// replacing it, so the current UI/workflows remain unchanged.

const ICONS = {
  trigger: Webhook,
  ai: Bot,
  communication: MessageSquare,
  data: Database,
  storage: HardDrive,
  web: Globe,
  logic: Workflow,
  transform: Braces,
  files: FileText,
  productivity: Calendar,
  default: Boxes,
};

const GROUP_ALIASES = [
  ["Triggers", /trigger|webhook|poll/i],
  ["AI", /ai|agent|openai|gemini|anthropic|langchain|model|embedding|vector/i],
  ["Communication", /gmail|email|slack|discord|telegram|teams|twilio|whatsapp|sms|message|mail/i],
  ["Data", /sheet|postgres|mysql|mongo|database|airtable|supabase|redis|snowflake|bigquery|data/i],
  ["Storage", /drive|dropbox|box|onedrive|s3|storage|file/i],
  ["Web", /http|api|graphql|webhook|url|wordpress|shopify/i],
  ["Logic", /if|switch|merge|filter|split|loop|router|branch/i],
  ["Data Transformation", /set|edit|code|json|transform|convert|sort|aggregate|date|function/i],
  ["Files", /pdf|spreadsheet|excel|csv|document|file/i],
  ["Productivity", /notion|calendar|trello|asana|jira|linear|todo|task|clickup/i],
];

function groupForNode(node) {
  const text = `${node.displayName || ""} ${node.name || ""} ${node.description || ""}`;
  if (node.codex?.categories?.includes("AI")) return "AI";
  for (const [group, regex] of GROUP_ALIASES) {
    if (regex.test(text)) return group;
  }
  return "Other n8n Nodes";
}

function iconForGroup(group) {
  if (group === "AI") return ICONS.ai;
  if (group === "Triggers") return ICONS.trigger;
  if (group === "Communication") return ICONS.communication;
  if (group === "Data") return ICONS.data;
  if (group === "Storage") return ICONS.storage;
  if (group === "Web") return ICONS.web;
  if (group === "Logic") return ICONS.logic;
  if (group === "Data Transformation") return ICONS.transform;
  if (group === "Files") return FileText;
  if (group === "Productivity") return ICONS.productivity;
  return ICONS.default;
}

function slug(value) {
  return String(value || "node")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function findExistingKey(displayName) {
  const target = String(displayName || "").trim().toLowerCase();
  return Object.entries(nodeDefinitions).find(
    ([, def]) => String(def.label || "").trim().toLowerCase() === target
  )?.[0];
}

function compactConfigFields(node) {
  const properties = Array.isArray(node.properties) ? node.properties : [];
  const fields = properties
    .filter((p) => p?.name && ["string", "number", "boolean", "options"].includes(p.type))
    .slice(0, 5)
    .map((p) => ({
      key: p.name,
      label: p.displayName || p.name,
      type: p.type === "options" ? "select" : "text",
      options: p.type === "options" ? (p.options || []).slice(0, 30).map((o) => o.name || o.value) : undefined,
    }));

  return fields.length ? fields : [{ key: "notes", label: "Notes", type: "text" }];
}

export function registerN8nNodes(rawNodes = []) {
  if (!Array.isArray(rawNodes)) return { added: 0, updated: 0 };

  let added = 0;
  let updated = 0;

  rawNodes.forEach((node) => {
    if (!node?.name || !node?.displayName) return;
    const existingKey = findExistingKey(node.displayName);
    const group = existingKey ? nodeDefinitions[existingKey].group : groupForNode(node);
    const icon = existingKey ? nodeDefinitions[existingKey].icon : iconForGroup(group);
    const category = group === "Triggers" ? "trigger" : group === "Logic" ? "logic" : "action";
    const n8n = {
      type: node.name,
      typeVersion: Array.isArray(node.version) ? node.defaultVersion || node.version[node.version.length - 1] : node.version,
      package: node.name.startsWith("@n8n/") ? "@n8n" : "n8n-nodes-base",
      description: node.description || "",
      credentials: (node.credentials || []).map((c) => c.name).filter(Boolean),
    };

    if (existingKey) {
      nodeDefinitions[existingKey].n8n = n8n;
      nodeDefinitions[existingKey].n8nInstalled = true;
      updated += 1;
      return;
    }

    const key = `n8n-${slug(node.name)}-${slug(node.displayName)}`;
    if (nodeDefinitions[key]) return;

    nodeDefinitions[key] = {
      label: node.displayName,
      group,
      category,
      icon,
      defaultAction: node.subtitle || `Use ${node.displayName}`,
      description: node.description || `Use the ${node.displayName} node from your connected n8n instance.`,
      configFields: compactConfigFields(node),
      n8n,
      n8nInstalled: true,
      learn: {
        what: node.description || `${node.displayName} is an n8n workflow node.`,
        why: `Use ${node.displayName} when your automation needs this capability.`,
        example: `Add ${node.displayName} after a trigger or processing step, then configure it in n8n.`,
        concepts: ["n8n", "Workflow node", "Automation"],
      },
    };
    added += 1;
  });

  return { added, updated };
}

export function getN8nNodeCount() {
  return Object.values(nodeDefinitions).filter((def) => def.n8nInstalled).length;
}
