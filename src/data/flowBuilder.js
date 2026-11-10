import { nodeDefinitions } from "./nodeDefinitions";

let idCounter = 0;
function uniqueId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

/**
 * Builds a React Flow node object from a node type key.
 * `overrides` can set a custom action/description/position.
 */
export function createFlowNode(nodeType, { position, action, id } = {}) {
  const def = nodeDefinitions[nodeType];
  if (!def) throw new Error(`Unknown node type: ${nodeType}`);

  return {
    id: id || uniqueId(nodeType),
    type: "flowNode",
    position: position || { x: 0, y: 0 },
    data: {
      nodeType,
      category: def.category,
      label: def.label,
      action: action || def.defaultAction,
      description: def.description,
      config: {},
      status: "idle",
    },
  };
}

/**
 * Lays out a simple left-to-right chain of node types and connects them
 * with edges. Used by the AI generator and by workflow templates.
 * If a node in the chain is an "if" node, both its TRUE and FALSE outputs
 * are connected to the following node by default (kept simple for the
 * auto-generated case — the user can rewire branches manually).
 */
export function buildChain(nodeTypes) {
  const spacingX = 260;
  const nodes = nodeTypes.map((nodeType, index) =>
    createFlowNode(nodeType, { position: { x: index * spacingX, y: 120 } })
  );

  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const source = nodes[i];
    const target = nodes[i + 1];

    if (source.data.nodeType === "if") {
      edges.push({
        id: uniqueId("edge"),
        source: source.id,
        sourceHandle: "true",
        target: target.id,
        label: "TRUE",
      });
      edges.push({
        id: uniqueId("edge"),
        source: source.id,
        sourceHandle: "false",
        target: target.id,
        label: "FALSE",
      });
    } else {
      edges.push({
        id: uniqueId("edge"),
        source: source.id,
        target: target.id,
      });
    }
  }

  return { nodes, edges };
}
