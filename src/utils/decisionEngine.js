// Stage 4 (AI vs Rule-Based Decision). A node needs real AI reasoning when
// its job is open-ended — generating or interpreting content that doesn't
// have a fixed, predictable shape. Everything else is deterministic enough
// to run as a plain rule-based step, which is cheaper, faster, and easier
// to debug than routing it through a model.
const AI_NODE_TYPES = new Set([
  "ai-agent",
  "openai",
  "gemini",
  "text-summarizer",
  "text-classifier",
]);

const AI_REASONS = {
  "ai-agent": "Its instructions are open-ended, so it needs a model to reason over the data rather than follow a fixed rule.",
  openai: "Generating text has no single correct output, which is exactly what a language model is for.",
  gemini: "Generating text has no single correct output, which is exactly what a language model is for.",
  "text-summarizer": "Summarizing means judging what's important in free-form text — a rule can't do that reliably.",
  "text-classifier": "Labeling open-ended text into categories needs language understanding, not a fixed comparison.",
};

const RULE_REASONS = {
  trigger: "Starting a workflow on a known event is a fixed, predictable check — no reasoning required.",
  logic: "This is a direct comparison against a value, so a rule evaluates it instantly and consistently.",
  action: "This step calls a specific service with known inputs — a direct integration is faster and more reliable than AI.",
};

export function classifyNodeDecision(node) {
  const { nodeType, label, category } = node.data;
  const isAI = AI_NODE_TYPES.has(nodeType);

  return {
    id: node.id,
    label,
    nodeType,
    decision: isAI ? "ai" : "rule",
    reason: isAI
      ? AI_REASONS[nodeType] || "This step involves open-ended reasoning, so it runs through AI."
      : RULE_REASONS[category] || "This step is deterministic, so a rule-based action handles it.",
  };
}

export function classifyWorkflowDecisions(nodes) {
  return nodes.map(classifyNodeDecision);
}
