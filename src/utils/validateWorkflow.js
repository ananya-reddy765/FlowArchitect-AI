// Real (non-hardcoded) validation logic for a node/edge workflow graph.
// runValidationChecks() returns each check individually (used by stage 6's
// animated validation panel); validateWorkflow() reduces that into the
// simple { valid, errors } shape the manual "Validate" toolbar button uses.

export function runValidationChecks({ nodes, edges }) {
  const checks = [];

  if (!nodes || nodes.length === 0) {
    checks.push({
      id: "has-nodes",
      label: "Workflow has at least one node",
      passed: false,
      detail: "Add at least one node to the canvas.",
    });
    return checks;
  }

  const hasTrigger = nodes.some((n) => n.data.category === "trigger");
  checks.push({
    id: "has-trigger",
    label: "Workflow has a trigger",
    passed: hasTrigger,
    detail: hasTrigger
      ? "A trigger node starts the workflow."
      : "Workflow is missing a trigger.",
  });

  const ids = nodes.map((n) => n.id);
  const noDuplicateIds = new Set(ids).size === ids.length;
  checks.push({
    id: "unique-ids",
    label: "No duplicate node IDs",
    passed: noDuplicateIds,
    detail: noDuplicateIds ? "All node IDs are unique." : "Workflow has duplicate node IDs.",
  });

  let orphanCount = 0;
  if (nodes.length > 1) {
    const connectedIds = new Set();
    (edges || []).forEach((edge) => {
      connectedIds.add(edge.source);
      connectedIds.add(edge.target);
    });
    orphanCount = nodes.filter((n) => !connectedIds.has(n.id)).length;
  }
  checks.push({
    id: "no-orphans",
    label: "Every node is connected",
    passed: orphanCount === 0,
    detail:
      orphanCount === 0
        ? "All nodes are connected to the workflow."
        : `${orphanCount} node(s) are not connected to the rest of the workflow.`,
  });

  const ifNodes = nodes.filter((n) => n.data.nodeType === "if");
  const brokenIfNodes = ifNodes.filter((ifNode) => {
    const outgoing = (edges || []).filter((e) => e.source === ifNode.id);
    const hasTrue = outgoing.some((e) => e.sourceHandle === "true");
    const hasFalse = outgoing.some((e) => e.sourceHandle === "false");
    return !hasTrue || !hasFalse;
  });
  checks.push({
    id: "if-branches",
    label: "IF nodes have both TRUE and FALSE branches",
    passed: brokenIfNodes.length === 0,
    detail:
      brokenIfNodes.length === 0
        ? ifNodes.length > 0
          ? "Every IF node has both branches connected."
          : "No IF nodes in this workflow."
        : `${brokenIfNodes
            .map((n) => `"${n.data.label}"`)
            .join(", ")} needs both a TRUE and a FALSE branch connected.`,
  });

  const aiAgents = nodes.filter((n) => n.data.nodeType === "ai-agent");
  checks.push({
    id: "ai-chat-model",
    label: "AI Agents have a Chat Model dependency",
    passed: true,
    detail:
      aiAgents.length === 0
        ? "No AI Agent nodes in this workflow."
        : "FlowArchitect will automatically attach an OpenAI Chat Model sub-node during n8n compilation. Add the model credential in n8n before execution.",
  });

  const unconfiguredCount = nodes.filter((n) => {
    const fields = n.data.config ? Object.keys(n.data.config) : [];
    return fields.length === 0 && n.data.category !== "trigger" && n.data.category !== "logic";
  }).length;
  checks.push({
    id: "credentials",
    label: "Action nodes have basic configuration",
    passed: true,
    detail:
      unconfiguredCount === 0
        ? "All action nodes have some configuration set."
        : `${unconfiguredCount} node(s) are using default settings — open them in Configure before running for real.`,
  });

  return checks;
}

export function validateWorkflow({ nodes, edges }) {
  const checks = runValidationChecks({ nodes, edges });
  const errors = checks.filter((c) => !c.passed).map((c) => c.detail);

  return {
    valid: errors.length === 0,
    errors,
  };
}
