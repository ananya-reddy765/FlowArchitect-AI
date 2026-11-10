import { buildChain } from "../data/flowBuilder";

// Simulated AI requirement analysis — recognizes keywords in the user's
// plain-English description and builds a chain of real node objects
// (trigger → actions), the same shape used everywhere else in the canvas.
// No real AI/API call happens here; this is a frontend-only prototype.

const triggerKeywords = [
  { keywords: ["every morning", "schedule", "daily"], nodeType: "schedule" },
  { keywords: ["form submission", "form"], nodeType: "form-submission" },
  { keywords: ["webhook"], nodeType: "webhook" },
  { keywords: ["gmail", "invoice", "email"], nodeType: "gmail-trigger" },
];

// Order matters: keywords are matched, then sorted by where they first
// appear in the text, so the generated chain follows the user's wording.
// Notice "send-email" only matches specific email-sending phrases, not a
// bare "email" — otherwise "notify me on Slack" (which merely mentions
// email as the trigger medium) would incorrectly also add an email node.
const actionKeywords = [
  { keywords: ["google drive", "drive"], nodeType: "google-drive" },
  { keywords: ["google sheets", "sheets"], nodeType: "google-sheets" },
  { keywords: ["discord"], nodeType: "discord" },
  { keywords: ["slack"], nodeType: "slack" },
  { keywords: ["database", "postgres", "mysql"], nodeType: "postgresql" },
  { keywords: ["report"], nodeType: "ai-agent" },
  { keywords: ["summarize", " ai ", "ai-powered"], nodeType: "ai-agent" },
  { keywords: ["api"], nodeType: "http-request" },
  { keywords: ["if ", "condition"], nodeType: "if" },
  {
    keywords: [
      "confirmation email",
      "send an email",
      "email the team",
      "by email",
      "send it by email",
    ],
    nodeType: "send-email",
  },
];

export function findTrigger(text) {
  const match = triggerKeywords.find((entry) =>
    entry.keywords.some((keyword) => text.includes(keyword))
  );
  return match ? match.nodeType : "manual-trigger";
}

export function findActions(text) {
  const matches = actionKeywords
    .map((entry) => {
      const keyword = entry.keywords.find((k) => text.includes(k));
      if (!keyword) return null;
      return { nodeType: entry.nodeType, position: text.indexOf(keyword) };
    })
    .filter(Boolean)
    // Avoid adding "send-email" again if the trigger itself was email-based.
    .filter((entry) => !(entry.nodeType === "gmail-trigger"))
    .sort((a, b) => a.position - b.position)
    .map((entry) => entry.nodeType);

  // De-duplicate while preserving order.
  return [...new Set(matches)];
}

const NOTIFICATION_NODE_TYPES = new Set([
  "send-email",
  "gmail",
  "email",
  "slack",
  "slack-notification",
  "discord",
  "teams",
]);

const EMAIL_NODE_TYPES = new Set(["send-email", "gmail", "email", "gmail-trigger"]);
const CHANNEL_NODE_TYPES = new Set(["slack", "slack-notification", "discord", "teams"]);
const CONDITION_NODE_TYPES = new Set(["if", "switch", "filter"]);

// Applies answers gathered in the "clarify requirements" step directly to
// the config of the matching generated nodes, so an answer like "ops@site.com"
// actually lands on the email node's `to` field instead of only being
// appended as extra text.
export function applyClarifications(nodes, answers = {}) {
  if (!answers || Object.keys(answers).length === 0) return nodes;

  return nodes.map((node) => {
    const config = { ...node.data.config };
    let changed = false;

    if (answers.recipient && EMAIL_NODE_TYPES.has(node.data.nodeType)) {
      config.to = answers.recipient;
      changed = true;
    }
    if (answers.channel && CHANNEL_NODE_TYPES.has(node.data.nodeType)) {
      config.channel = answers.channel;
      changed = true;
    }
    if (answers.threshold && CONDITION_NODE_TYPES.has(node.data.nodeType)) {
      config.value = answers.threshold;
      changed = true;
    }
    if (answers.frequency && node.data.nodeType === "schedule") {
      config.frequency = answers.frequency;
      changed = true;
    }
    if (answers.webhookPath && node.data.nodeType === "webhook") {
      config.path = answers.webhookPath;
      changed = true;
    }

    if (!changed) return node;
    return { ...node, data: { ...node.data, config } };
  });
}

// Builds the plain-text "detected requirements" the AI Requirement Analysis
// stage displays — trigger, conditions, and actions in the order they were
// found, phrased the way a user would recognize.
export function describeDetectedRequirements({ trigger, actions, usedFallback }) {
  const lines = [`Trigger → ${humanizeNodeType(trigger)}`];
  const conditionAction = actions.find((a) => CONDITION_NODE_TYPES.has(a));
  if (conditionAction) lines.push(`Condition → ${humanizeNodeType(conditionAction)} check`);
  actions
    .filter((a) => !CONDITION_NODE_TYPES.has(a))
    .forEach((a) => lines.push(`Action → ${humanizeNodeType(a)}`));
  if (usedFallback) {
    lines.push("No specific service detected → defaulted to AI processing + email notice");
  }
  return lines;
}

function humanizeNodeType(nodeType) {
  return nodeType
    .split("-")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

export function generateWorkflow(input, answers = {}) {
  const text = ` ${input.toLowerCase()} `;

  const trigger = findTrigger(text);
  let actions = findActions(text);
  const usedFallback = actions.length === 0;

  if (usedFallback) {
    // Fallback per spec: Manual Trigger → AI/Process → Notification
    actions = ["ai-agent", "send-email"];
  }

  let { nodes, edges } = buildChain([trigger, ...actions]);
  nodes = applyClarifications(nodes, answers);

  return {
    name: guessName(text),
    description: `Automatically generated from: "${input.trim()}"`,
    nodes,
    edges,
    analysis: {
      trigger,
      actions,
      usedFallback,
      detected: describeDetectedRequirements({ trigger, actions, usedFallback }),
      hasNotificationStep: actions.some((a) => NOTIFICATION_NODE_TYPES.has(a)),
    },
  };
}

function guessName(text) {
  if (text.includes("invoice")) return "Invoice Email Automation";
  if (text.includes("lead") || text.includes("form"))
    return "Lead Management Automation";
  if (text.includes("report")) return "Daily Report Automation";
  if (text.includes("support") || text.includes("customer"))
    return "Customer Support Automation";
  return "Custom Automation Workflow";
}
