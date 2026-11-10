import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import {
  Bot,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X,
  PanelLeft,
  PanelRight,
} from "lucide-react";

import ExampleCard from "../components/ExampleCard";
import NodeLibrary from "../components/workflow/NodeLibrary";
import WorkflowCanvas from "../components/workflow/WorkflowCanvas";
import WorkflowToolbar from "../components/workflow/WorkflowToolbar";
import NodeConfigPanel from "../components/workflow/NodeConfigPanel";
import LearningPanel from "../components/workflow/LearningPanel";
import WorkflowSummary from "../components/workflow/WorkflowSummary";
import ExecutionPanel from "../components/workflow/ExecutionPanel";
import NodePicker from "../components/workflow/NodePicker";
import GenerationPipeline from "../components/workflow/GenerationPipeline";
import N8nExportPanel from "../components/workflow/N8nExportPanel";

import { useWorkflowBuilder } from "../hooks/useWorkflowBuilder";
import { validateWorkflow } from "../utils/validateWorkflow";
import { saveWorkflow } from "../utils/workflowStorage";
import { downloadJson } from "../utils/downloadJson";
import { convertToN8nWorkflow } from "../utils/n8nExporter";
import { learningTopics, explainWorkflow } from "../data/learningContent";
import { deployToN8n } from "../utils/n8nDeployClient";

const examples = [
  {
    title: "Invoice Automation",
    text: "Save Gmail invoice attachments to Google Drive and notify Slack.",
  },
  {
    title: "Lead Management",
    text: "When a new form submission arrives, add the lead to Google Sheets and send an email.",
  },
  {
    title: "Daily Report",
    text: "Every morning, generate a daily report and email it to the team.",
  },
  {
    title: "Customer Support",
    text: "When a customer submits a support request, create a task and notify the support team.",
  },
];


export default function CreateWorkflow() {
  const navigate = useNavigate();
  const location = useLocation();
  const builder = useWorkflowBuilder([], []);

  const [input, setInput] = useState("");
  const [showPipeline, setShowPipeline] = useState(false);
  const [mode, setMode] = useState("builder"); // "builder" | "learn"
  const [rightTab, setRightTab] = useState("configure"); // "configure" | "n8n" | "learn"
  const [showLibrary, setShowLibrary] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [message, setMessage] = useState(null);
  const workflowIdRef = useRef(null);

  const [workflowMeta, setWorkflowMeta] = useState({
    name: "Untitled Workflow",
    description: "",
  });

  // A template can be selected from the dedicated Templates page and passed
  // here through router state. This keeps template browsing separate from
  // workflow creation while preserving the existing builder behavior.
  useEffect(() => {
    const template = location.state?.template;
    if (!template) return;

    builder.loadWorkflow(template.nodes, template.edges);
    setWorkflowMeta({ name: template.name, description: template.description });
    setInput("");
    setMessage({ type: "success", text: `${template.name} template loaded — ready to fine-tune.` });

    const now = new Date().toISOString();
    const id = workflowIdRef.current || Date.now().toString();
    workflowIdRef.current = id;
    saveWorkflow({
      id,
      name: template.name,
      description: template.description,
      nodes: template.nodes,
      edges: template.edges,
      status: "Generated",
      createdAt: now,
      updatedAt: now,
      executionHistory: [],
    });

    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate]);

  // Live n8n export + AI-vs-rule reasoning, recomputed from whatever is
  // actually on the canvas right now — so it stays accurate even after the
  // user edits nodes by hand, not just right after generation.
  const n8nJson = useMemo(
    () => convertToN8nWorkflow({ nodes: builder.nodes, edges: builder.edges }, workflowMeta.name),
    [builder.nodes, builder.edges, workflowMeta.name]
  );

  function runGeneration() {
    if (!input.trim()) {
      setMessage({
        type: "error",
        text: "Please describe the workflow you want to automate.",
      });
      return;
    }
    setMessage(null);
    setShowPipeline(true);
  }

  function handlePipelineComplete(result) {
    builder.loadWorkflow(result.nodes, result.edges);
    setWorkflowMeta({ name: result.name, description: result.description });
    setShowPipeline(false);
    setRightTab("n8n");

    // A generated workflow is immediately persisted so the Dashboard reflects
    // it even if the user leaves the builder without pressing Save.
    const now = new Date().toISOString();
    const id = workflowIdRef.current || Date.now().toString();
    workflowIdRef.current = id;
    saveWorkflow({
      id,
      name: result.name,
      description: result.description,
      nodes: result.nodes,
      edges: result.edges,
      status: "Generated",
      createdAt: now,
      updatedAt: now,
      executionHistory: [],
    });

    setMessage({ type: "success", text: "Workflow generated and saved. Connecting to n8n..." });

    // Automatic n8n integration: generation remains useful even when n8n is
    // not configured. In that case the builder continues normally and the
    // user can deploy later from the n8n panel.
    const generatedN8n = convertToN8nWorkflow(
      { nodes: result.nodes, edges: result.edges },
      result.name
    );
    deployToN8n({ workflow: generatedN8n })
      .then((deployResult) => {
        setRightTab("n8n");
        setMessage({
          type: "success",
          text: deployResult.activated
            ? "Workflow generated and automatically created in n8n."
            : "Workflow generated and created in n8n, but activation needs review.",
        });
      })
      .catch((err) => {
        setRightTab("n8n");
        setMessage({
          type: "error",
          text: `Workflow generated successfully, but automatic n8n integration failed: ${err.message}`,
        });
      });
  }

  function handleExampleClick(text) {
    setInput(text);
  }

  function handleSave() {
    if (builder.nodes.length === 0) {
      setMessage({
        type: "error",
        text: "Your workflow needs additional information — add at least one node first.",
      });
      return;
    }

    const now = new Date().toISOString();
    const record = {
      id: workflowIdRef.current || Date.now().toString(),
      name: workflowMeta.name,
      description: workflowMeta.description,
      nodes: builder.nodes,
      edges: builder.edges,
      status: "Generated",
      createdAt: now,
      updatedAt: now,
      executionHistory: [],
    };

    workflowIdRef.current = record.id;
    saveWorkflow(record);
    setMessage({ type: "success", text: "Workflow saved successfully. Dashboard updated." });
  }

  function handleValidate() {
    const result = validateWorkflow({ nodes: builder.nodes, edges: builder.edges });
    setMessage(
      result.valid
        ? { type: "success", text: "Workflow is valid." }
        : { type: "error", text: result.errors.join(" ") }
    );
  }

  function handleExport() {
    downloadJson(
      {
        name: workflowMeta.name,
        nodes: builder.nodes,
        edges: builder.edges,
        settings: {},
        createdAt: new Date().toISOString(),
      },
      workflowMeta.name
    );
  }

  const hasWorkflow = builder.nodes.length > 0;

  function handleStartNew() {
    builder.loadWorkflow([], []);
    setWorkflowMeta({ name: "Untitled Workflow", description: "" });
    setInput("");
    setMessage(null);
    setRightTab("configure");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-white">
      {/* Top bar — sticky, so navigation and the Builder/Learn toggle stay
          reachable no matter how far down the page you've scrolled. */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-violet-600 transition shrink-0"
            >
              <ArrowRight size={15} className="rotate-180" />
              Dashboard
            </button>

            <span className="text-gray-300 shrink-0">/</span>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <Bot size={16} color="white" />
              </div>
              <span className="font-semibold text-gray-800 truncate">
                {hasWorkflow ? workflowMeta.name : "Create Workflow"}
              </span>
            </div>
          </div>

          {/* Builder | Learn toggle */}
          <button
            onClick={() => navigate("/templates")}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:text-violet-700 hover:border-violet-200 shadow-sm text-sm font-semibold transition shrink-0"
          >
            Templates
          </button>

          <div className="bg-gray-100 rounded-xl p-1 flex text-sm font-medium shrink-0">
            <button
              onClick={() => setMode("builder")}
              className={`px-4 py-2 rounded-lg transition ${
                mode === "builder" ? "bg-white shadow-sm text-violet-700" : "text-gray-500"
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setMode("learn")}
              className={`px-4 py-2 rounded-lg transition ${
                mode === "learn" ? "bg-white shadow-sm text-violet-700" : "text-gray-500"
              }`}
            >
              Learn
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* ============ COMPOSER (only before a workflow exists) ============ */}
        {!hasWorkflow && (
          <>
            <h2 className="text-3xl font-extrabold">Create Your Workflow</h2>
            <p className="text-gray-600 mt-2 text-lg max-w-2xl">
              Describe what you want to automate in plain English. FlowArchitect
              AI will turn your idea into a workflow.
            </p>

        {/* Input */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            maxLength={400}
            placeholder="Example: When I receive an invoice in Gmail, save the attachment to Google Drive and send a notification to Slack."
            className="w-full resize-none outline-none text-gray-800 placeholder:text-gray-400"
          />

          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-gray-400">{input.length}/400 characters</span>

            <button
              onClick={runGeneration}
              disabled={!input.trim()}
              className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
            >
              <Sparkles size={18} />
              Generate Workflow
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-700 mb-3">Try an example</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {examples.map((example) => (
              <ExampleCard
                key={example.title}
                title={example.title}
                description={example.text}
                onClick={() => handleExampleClick(example.text)}
              />
            ))}
          </div>
        </div>

          </>
        )}

        {/* ============ COMPACT HEADER (once a workflow exists) ============ */}
        {hasWorkflow && (
          <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
            <div className="min-w-[240px]">
              <input
                value={workflowMeta.name}
                onChange={(e) => setWorkflowMeta((m) => ({ ...m, name: e.target.value }))}
                className="text-2xl font-bold outline-none border-b-2 border-transparent focus:border-violet-400 bg-transparent w-full max-w-lg"
              />
              <p className="text-sm text-gray-500 mt-1">{builder.nodes.length} node(s)</p>
            </div>

            <button
              onClick={handleStartNew}
              className="text-sm font-semibold text-gray-500 hover:text-violet-600 border border-gray-200 hover:border-violet-200 rounded-xl px-4 py-2.5 transition shrink-0"
            >
              + New Workflow
            </button>
          </div>
        )}

        {message && (
          <div
            className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}
            {message.text}
          </div>
        )}

        {/* ============ BUILDER MODE ============ */}
        {mode === "builder" && (
          <ReactFlowProvider>
            <div>
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
                  onSave={handleSave}
                  onRun={builder.runWorkflow}
                  onValidate={handleValidate}
                  onUndo={builder.undo}
                  onRedo={builder.redo}
                  onExport={handleExport}
                  canUndo={builder.canUndo}
                  canRedo={builder.canRedo}
                  isRunning={builder.isRunning}
                />

                <div className="flex h-[calc(100vh-260px)] min-h-[520px]">
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
                        onClick={() => setRightTab("n8n")}
                        className={`flex-1 px-3 py-1.5 rounded-lg transition ${
                          rightTab === "n8n" ? "bg-white shadow-sm text-violet-700" : "text-gray-500"
                        }`}
                      >
                        n8n
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

                    {rightTab === "configure" && (
                      <NodeConfigPanel
                        node={builder.selectedNode}
                        onChangeConfig={(key, value) =>
                          builder.updateNodeConfig(builder.selectedNodeId, key, value)
                        }
                      />
                    )}
                    {rightTab === "n8n" && (
                      <N8nExportPanel n8nJson={n8nJson} workflowName={workflowMeta.name} />
                    )}
                    {rightTab === "learn" && <LearningPanel node={builder.selectedNode} />}
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

        {showPipeline && (
          <GenerationPipeline
            input={input}
            onComplete={handlePipelineComplete}
            onCancel={() => setShowPipeline(false)}
          />
        )}

        {/* ============ LEARN MODE ============ */}
        {mode === "learn" && (
          <div className="mt-8 space-y-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-bold text-lg mb-2">Learn This Workflow</h3>
              <p className="text-gray-600">{explainWorkflow(builder.nodes)}</p>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Core Concepts</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {learningTopics.map((topic) => (
                  <div
                    key={topic.title}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                  >
                    <h4 className="font-semibold text-gray-800">{topic.title}</h4>
                    <p className="text-gray-500 text-sm mt-2">{topic.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
