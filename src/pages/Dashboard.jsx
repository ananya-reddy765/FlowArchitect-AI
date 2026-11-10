import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Bot,
  Plus,
  Workflow,
  CheckCircle2,
  Play,
  Download,
  ArrowRight,
  Sparkles,
  UserCircle,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { getWorkflows, getWorkflowStorageEventName } from "../utils/workflowStorage";

const statusStyles = {
  Generated: "bg-violet-100 text-violet-700",
  Validated: "bg-green-100 text-green-700",
  Executed: "bg-yellow-100 text-yellow-700",
  Exported: "bg-blue-100 text-blue-700",
};

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function triggerLabel(workflow) {
  if (workflow.nodes) {
    const trigger = workflow.nodes.find((n) => n.data?.category === "trigger");
    return trigger ? trigger.data.label : "—";
  }
  return workflow.trigger?.app || "—";
}

function nodeCount(workflow) {
  if (workflow.nodes) return workflow.nodes.length;
  if (workflow.steps) return 1 + workflow.steps.length;
  return 0;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Read from localStorage as the initial state so this reflects
  // whatever was saved on the Create Workflow page. Since this is a
  // routed page, it fully remounts on each visit, so this re-reads
  // fresh data every time the user lands here.
  const [workflows, setWorkflows] = useState(() => getWorkflows());

  // Keep dashboard statistics and the recent-workflow list live.
  // localStorage does not fire the native `storage` event in the same tab,
  // so workflowStorage also emits a small custom event after every change.
  useEffect(() => {
    const refresh = () => setWorkflows(getWorkflows());
    const eventName = getWorkflowStorageEventName();
    window.addEventListener(eventName, refresh);
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    refresh();
    return () => {
      window.removeEventListener(eventName, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const stats = [
    {
      label: "Total Workflows",
      value: workflows.length,
      icon: <Workflow size={20} />,
    },
    {
      label: "Validated",
      value: workflows.filter((w) => w.status === "Validated").length,
      icon: <CheckCircle2 size={20} />,
    },
    {
      label: "Executed",
      value: workflows.filter((w) => w.status === "Executed").length,
      icon: <Play size={20} />,
    },
    {
      label: "Exported",
      value: workflows.filter((w) => w.status === "Exported").length,
      icon: <Download size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-white">
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-8 h-20 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center">
            <Bot size={22} color="white" />
          </div>
          <div>
            <h1 className="font-bold text-xl">FlowArchitect AI</h1>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block text-right"><p className="text-sm font-semibold">{user?.name}</p><p className="text-xs text-gray-500">{user?.email}</p></div>
            <div className="relative group">
              <button className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"><UserCircle size={26} className="text-violet-600"/></button>
              <div className="hidden group-hover:block absolute right-0 top-12 w-56 bg-white border shadow-xl rounded-2xl p-2 z-50">
                <button onClick={() => navigate("/security")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"><ShieldCheck size={16}/> Security & API Keys</button>
                <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex items-center gap-2"><LogOut size={16}/> Log out</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <h2 className="text-4xl font-extrabold">Welcome to FlowArchitect AI</h2>
        <p className="text-gray-600 mt-3 text-lg">
          Design intelligent workflows using natural language.
        </p>

        <button
          onClick={() => navigate("/create-workflow")}
          className="mt-8 bg-violet-600 hover:bg-violet-700 transition text-white px-7 py-4 rounded-xl font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Workflow
        </button>

        {/* Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-lg transition"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                {stat.icon}
              </div>
              <p className="text-3xl font-extrabold mt-4">{stat.value}</p>
              <p className="text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Workflows */}
        <div className="mt-14">
          <h3 className="text-2xl font-bold mb-6">Recent Workflows</h3>

          {workflows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
              <div className="w-14 h-14 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <p className="text-gray-600 mt-4">No workflows created yet.</p>
              <button
                onClick={() => navigate("/create-workflow")}
                className="mt-5 bg-violet-600 hover:bg-violet-700 transition text-white px-6 py-3 rounded-xl font-semibold"
              >
                Create Your First Workflow
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {workflows.map((wf) => (
                <button
                  key={wf.id}
                  onClick={() => navigate(`/workflow/${wf.id}`)}
                  className="w-full text-left bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-center justify-between hover:shadow-lg hover:border-violet-300 transition"
                >
                  <div className="min-w-0">
                    <h4 className="font-semibold text-lg">{wf.name}</h4>
                    <p className="text-gray-500 mt-1">
                      Trigger: {triggerLabel(wf)} · {nodeCount(wf)} node
                      {nodeCount(wf) === 1 ? "" : "s"}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">{formatDate(wf.createdAt)}</p>
                  </div>

                  <span
                    className={`shrink-0 ml-4 px-4 py-2 rounded-full text-sm font-medium ${
                      statusStyles[wf.status] || statusStyles.Generated
                    }`}
                  >
                    {wf.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => navigate("/")}
          className="mt-14 text-gray-500 hover:text-violet-600 transition flex items-center gap-2"
        >
          <ArrowRight size={16} className="rotate-180" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
