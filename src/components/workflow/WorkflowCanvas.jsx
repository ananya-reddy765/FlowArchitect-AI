import { useCallback, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import WorkflowNode from "./WorkflowNode";
import { createFlowNode } from "../../data/flowBuilder";

export default function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSelectNode,
  onAddNode,
  onEditNode,
  onDeleteNode,
}) {
  const wrapperRef = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const nodeTypes = useMemo(
    () => ({
      flowNode: (props) => (
        <WorkflowNode {...props} onEdit={onEditNode} onDelete={onDeleteNode} />
      ),
    }),
    [onEditNode, onDeleteNode]
  );

  const handleConnect = useCallback(
    (connection) => onConnect(addEdge(connection, edges)),
    [edges, onConnect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData("application/flowarchitect-node");
      if (!nodeType) return;

      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newNode = createFlowNode(nodeType, { position });
      onAddNode(newNode);
    },
    [screenToFlowPosition, onAddNode]
  );

  return (
    <div ref={wrapperRef} className="w-full h-full" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={(_, node) => onSelectNode(node.id)}
        onPaneClick={() => onSelectNode(null)}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background gap={20} color="#ede9fe" />
        <Controls />
        <MiniMap
          pannable
          zoomable
          nodeColor="#a78bfa"
          maskColor="rgba(237, 233, 254, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}
