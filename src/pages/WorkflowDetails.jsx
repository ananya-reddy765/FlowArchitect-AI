import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import {
  Bot,
  ArrowRight,
  Trash2,
  CheckCircle2,
  X,
  PanelLeft,
  PanelRight,
} from "lucide-react";

import NodeLibrary from "../components/workflow/NodeLibrary";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import WorkflowToolbar from "../components/workflow/WorkflowToolbar";
import NodeConfigPanel from "../components/workflow/NodeConfigPanel";
import LearningPanel from "../components/workflow/LearningPanel";
import WorkflowSummary from "../components/workflow/WorkflowSummary";
import ExecutionPanel from "../components/workflow/ExecutionPanel";
import NodePicker from "../components/workflow/NodePicker";

import { useWorkflowBuilder } from "../hooks/useWorkflowBuilder";
import { validateWorkflow } from "../utils/validateWorkflow";
import {
  getWorkflowById,
  updateWorkflow,
  deleteWorkflow,
} from "../utils/workflowStorage";
import { downloadJson } from "../utils/downloadJson";

const statusStyles = {
  Generated: "bg-violet-100 text-violet-700",
  Validated: "bg-green-100 text-green-700",
  Executed: "bg-yellow-100 text-yellow-700",
  Exported: "bg-blue-100 text-blue-700",
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorkflowDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(() => getWorkflowById(id));
  const [message, setMessage] = useState(null);
  const [rightTab, setRightTab] = useState("configure");
  const [showLibrary, setShowLibrary] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const isLegacy = record && !record.nodes;

  const builder = useWorkflowBuilder(record?.nodes || [], record?.edges || []);

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-white flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Workflow not found</h1>
          <p className="text-gray-500 mt-2">
            It may have been deleted, or the link is incorrect.
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 text-violet-600 font-medium hover:text-violet-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  function persist(updates) {
    const updatedList = updateWorkflow(id, { ...updates, updatedAt: new Date().toISOString() });
    setRecord(updatedList.find((w) => w.id === id));
  }

  function handleValidate() {
    const result = validateWorkflow({ nodes: builder.nodes, edges: builder.edges });
    if (result.valid) {
      persist({ status: "Validated" });
      setMessage({ type: "success", text: "Workflow validated successfully." });
    } else {
      setMessage({ type: "error", text: result.errors.join(" ") });
    }
  }

  function handleRun() {
    builder.runWorkflow();
    persist({ status: "Executed" });
  }

  function handleSaveEdits() {
    persist({ nodes: builder.nodes, edges: builder.edges });
    setMessage({ type: "success", text: "Changes saved." });
  }

  function handleExport() {
    downloadJson(
      { name: record.name, nodes: builder.nodes, edges: builder.edges, settings: {}, createdAt: record.createdAt },
      record.name
    );
    persist({ status: "Exported" });
  }

  function handleDelete() {
    const confirmed = window.confirm("Delete this workflow? This cannot be undone.");
    if (!confirmed) return;
    deleteWorkflow(id);
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-white">
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center">
            <Bot size={22} color="white" />
          </div>
          <div>
            <h1 className="font-bold text-xl">FlowArchitect AI</h1>
            <p className="text-xs text-gray-500">Workflow Details</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-3xl font-extrabold">{record.name}</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">{record.description}</p>
            <p className="text-gray-400 text-sm mt-2">
              Created {formatDate(record.createdAt)}
              {record.updatedAt && record.updatedAt !== record.createdAt && (
                <> · Updated {formatDate(record.updatedAt)}</>
              )}
            </p>
          </div>

          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              statusStyles[record.status] || statusStyles.Generated
            }`}
          >
            {record.status}
          </span>
        </div>

        {message && (
          <div
            className={`mt-5 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium max-w-xl ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}
            {message.text}
          </div>
        )}

        {isLegacy ? (
          <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
            <p className="text-gray-600">
              This workflow was created in an earlier version of the builder
              and can't be opened in the visual canvas. You can still delete
              it below and recreate it with Create Workflow.
            </p>
          </div>
        ) : (
          <ReactFlowProvider>
            <div className="mt-6">
              <div className="flex lg:hidden gap-2 mb-2">
                <button
                  onClick={() => setShowLibrary((s) => !s)}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200"
                >
                  <PanelLeft size={15} /> Library
                </button>
                <button
                  onClick={() => setShowRightPanel((s) => !s)}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200"
                >
                  <PanelRight size={15} /> Panel
                </button>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <WorkflowToolbar
                  onAddNodeClick={() => setShowPicker(true)}
                  onSave={handleSaveEdits}
                  onRun={handleRun}
                  onValidate={handleValidate}
                  onUndo={builder.undo}
                  onRedo={builder.redo}
                  onExport={handleExport}
                  canUndo={builder.canUndo}
                  canRedo={builder.canRedo}
                  isRunning={builder.isRunning}
                />

                <div className="flex" style={{ height: "600px" }}>
                  <div className={`${showLibrary ? "block" : "hidden"} lg:block w-full max-w-[240px] shrink-0`}>
                    <NodeLibrary onAddNode={builder.addNode} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <WorkflowCanvas
                      nodes={builder.nodes}
                      edges={builder.edges}
                      onNodesChange={builder.onNodesChange}
                      onEdgesChange={builder.onEdgesChange}
                      onConnect={builder.onConnect}
                      onSelectNode={builder.setSelectedNodeId}
                      onAddNode={builder.addNode}
                      onEditNode={builder.setSelectedNodeId}
                      onDeleteNode={builder.deleteNode}
                    />
                  </div>

                  <div
                    className={`${showRightPanel ? "flex" : "hidden"} lg:flex w-full max-w-[300px] shrink-0 flex-col gap-4 p-4 overflow-y-auto border-l border-gray-100 bg-gray-50/50`}
                  >
                    <WorkflowSummary nodes={builder.nodes} />

                    <ExecutionPanel log={builder.executionLog} />

                    <div className="bg-gray-100 rounded-xl p-1 flex text-xs font-medium">
                      <button
                        onClick={() => setRightTab("configure")}
                        className={`flex-1 px-3 py-1.5 rounded-lg transition ${
                          rightTab === "configure" ? "bg-white shadow-sm text-violet-700" : "text-gray-500"
                        }`}
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => setRightTab("learn")}
                        className={`flex-1 px-3 py-1.5 rounded-lg transition ${
                          rightTab === "learn" ? "bg-white shadow-sm text-violet-700" : "text-gray-500"
                        }`}
                      >
                        Learn
                      </button>
                    </div>

                    {rightTab === "configure" ? (
                      <NodeConfigPanel
                        node={builder.selectedNode}
                        onChangeConfig={(key, value) =>
                          builder.updateNodeConfig(builder.selectedNodeId, key, value)
                        }
                      />
                    ) : (
                      <LearningPanel node={builder.selectedNode} />
                    )}
                  </div>
                </div>
              </div>

              {builder.isRunning && (
                <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />
                  Running workflow simulation — watch the nodes light up on the canvas...
                </div>
              )}

              {showPicker && (
                <NodePicker onAddNode={builder.addNode} onClose={() => setShowPicker(false)} />
              )}
            </div>
          </ReactFlowProvider>
        )}

        <div className="flex flex-wrap gap-3 mt-6">
          <button
            onClick={handleDelete}
            className="border border-red-200 text-red-600 px-5 py-3 rounded-xl flex items-center gap-2 hover:bg-red-50 transition"
          >
            <Trash2 size={18} />
            Delete Workflow
          </button>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-10 text-gray-500 hover:text-violet-600 transition flex items-center gap-2"
        >
          <ArrowRight size={16} className="rotate-180" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
