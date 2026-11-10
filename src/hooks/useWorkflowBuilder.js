import { useCallback, useState } from "react";
import { useNodesState, useEdgesState, applyNodeChanges } from "@xyflow/react";
import { createFlowNode } from "../data/flowBuilder";

const HISTORY_LIMIT = 30;

/**
 * Encapsulates all the state and actions the workflow canvas needs:
 * nodes/edges, node selection, undo/redo history, and the "Run" execution
 * simulation. Shared between the Create Workflow builder and the saved
 * Workflow Details page so both behave consistently.
 */
export function useWorkflowBuilder(initialNodes = [], initialEdges = []) {
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChangeRaw] = useEdgesState(initialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const [executionLog, setExecutionLog] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // Records the current nodes/edges as a checkpoint before a committed
  // change (adding/deleting a node, connecting an edge, editing config).
  // Live-dragging a node's position is intentionally NOT checkpointed,
  // so undo doesn't fill up with tiny position tweaks.
  const checkpoint = useCallback(() => {
    setPast((prev) => [...prev.slice(-HISTORY_LIMIT + 1), { nodes, edges }]);
    setFuture([]);
  }, [nodes, edges]);

  const onNodesChange = useCallback(
    (changes) => {
      const isPositionDrag = changes.some(
        (c) => c.type === "position" && c.dragging
      );
      if (!isPositionDrag) {
        // Structural change (e.g. remove) — checkpoint first.
        const hasRemoval = changes.some((c) => c.type === "remove");
        if (hasRemoval) checkpoint();
      }
      setNodes((nds) => applyNodeChanges(changes, nds));
    },
    [checkpoint, setNodes]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      onEdgesChangeRaw(changes);
    },
    [onEdgesChangeRaw]
  );

  const onConnect = useCallback(
    (newEdges) => {
      checkpoint();
      setEdges(newEdges);
    },
    [checkpoint, setEdges]
  );

  const addNode = useCallback(
    (nodeTypeOrNode) => {
      checkpoint();
      const newNode =
        typeof nodeTypeOrNode === "string"
          ? createFlowNode(nodeTypeOrNode, {
              position: { x: 80 + nodes.length * 40, y: 80 + nodes.length * 40 },
            })
          : nodeTypeOrNode;
      setNodes((nds) => [...nds, newNode]);
    },
    [checkpoint, nodes.length, setNodes]
  );

  const deleteNode = useCallback(
    (id) => {
      checkpoint();
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      setSelectedNodeId((current) => (current === id ? null : current));
    },
    [checkpoint, setNodes, setEdges]
  );

  const updateNodeConfig = useCallback(
    (id, key, value) => {
      checkpoint();
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, config: { ...n.data.config, [key]: value } } }
            : n
        )
      );
    },
    [checkpoint, setNodes]
  );

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev;
      const previous = prev[prev.length - 1];
      setFuture((f) => [{ nodes, edges }, ...f]);
      setNodes(previous.nodes);
      setEdges(previous.edges);
      return prev.slice(0, -1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev;
      const next = prev[0];
      setPast((p) => [...p, { nodes, edges }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return prev.slice(1);
    });
  }, [nodes, edges, setNodes, setEdges]);

  const loadWorkflow = useCallback(
    (newNodes, newEdges) => {
      setNodes(newNodes);
      setEdges(newEdges);
      setPast([]);
      setFuture([]);
      setSelectedNodeId(null);
      setExecutionLog([]);
    },
    [setNodes, setEdges]
  );

  // Simulates running the workflow: walks nodes in order, marking each
  // "running" then "success" with a short delay, and building a log.
  // This is a simulation only — no real API calls are made.
  const runWorkflow = useCallback(() => {
    if (nodes.length === 0 || isRunning) return;
    setIsRunning(true);
    setExecutionLog(nodes.map((n) => ({ label: n.data.label, status: "waiting" })));

    const setStatus = (index, status) => {
      setNodes((nds) =>
        nds.map((n, i) => (i === index ? { ...n, data: { ...n.data, status } } : n))
      );
      setExecutionLog((log) =>
        log.map((entry, i) => (i === index ? { ...entry, status } : entry))
      );
    };

    nodes.forEach((_, index) => {
      setTimeout(() => setStatus(index, "running"), index * 700);
      setTimeout(() => setStatus(index, "success"), index * 700 + 500);
    });

    setTimeout(() => {
      setIsRunning(false);
    }, nodes.length * 700 + 500);
  }, [nodes, isRunning, setNodes]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    updateNodeConfig,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    loadWorkflow,
    runWorkflow,
    isRunning,
    executionLog,
  };
}
