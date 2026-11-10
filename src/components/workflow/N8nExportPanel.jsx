import { useState } from "react";
import {
  Workflow,
  Copy,
  Download,
  Check,
  Info,
  Zap,
  Loader2,
  ExternalLink,
  AlertTriangle,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { downloadJson } from "../../utils/downloadJson";
import { deployToN8n } from "../../utils/n8nDeployClient";

export default function N8nExportPanel({ n8nJson, workflowName }) {
  const [copied, setCopied] = useState(false);
  const [showDeploy, setShowDeploy] = useState(false);

  const proxyUrl = "http://localhost:4000";
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState(null);
  const [deployError, setDeployError] = useState(null);

  if (!n8nJson || n8nJson.nodes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-gray-400">
        <Workflow size={22} className="mx-auto mb-2" />
        <p className="text-sm">Generate or build a workflow to get its n8n export.</p>
      </div>
    );
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(n8nJson, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permissions can fail silently in some browsers — the
      // download button below always works as a fallback.
    }
  }

  function handleDownload() {
    downloadJson(n8nJson, `${workflowName || "flowarchitect-workflow"}-n8n`);
  }

  async function handleDeploy() {
    setDeploying(true);
    setDeployError(null);
    setDeployResult(null);
    try {
      const result = await deployToN8n({ proxyUrl, workflow: n8nJson });
      setDeployResult(result);
    } catch (err) {
      setDeployError(err.message);
    } finally {
      setDeploying(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <Workflow size={16} className="text-violet-600" />
        <h3 className="font-bold text-gray-800">n8n Export</h3>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {n8nJson.nodes.length} node(s) mapped to real n8n node types.
      </p>

      {/* No credentials needed for either of these — this is the path for
          anyone who isn't managing an n8n API key. */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold border border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-xl px-3 py-2 transition"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          {copied ? "Copied" : "Copy JSON"}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-3 py-2 transition"
        >
          <Download size={15} />
          Download
        </button>
      </div>

      <div className="mt-3 flex gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
        <Info size={14} className="shrink-0 mt-0.5 text-gray-400" />
        <div>
          <p className="font-semibold text-gray-600 mb-1">Bring this into n8n — no account needed</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Open your n8n editor and start a new (or existing) workflow.</li>
            <li>Click "Copy JSON," then click the canvas and press Ctrl/Cmd+V — n8n pastes it as real nodes.</li>
            <li>Or use the downloaded file with n8n's menu → Import from File.</li>
            <li>Add your own credentials to each node before running it live.</li>
          </ol>
        </div>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <Zap size={14} className="text-violet-600" />
              n8n Assistant Integration
            </p>
            <p className="text-xs text-gray-500 mt-1">
              FlowArchitect sends the generated workflow to your connected local n8n instance automatically.
              The n8n API key stays only in <code className="bg-gray-100 px-1 rounded">server/.env</code>.
            </p>
          </div>
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="shrink-0 flex items-center justify-center gap-1.5 text-sm font-semibold bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white rounded-xl px-3 py-2.5 transition"
          >
            {deploying ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            {deploying ? "Connecting..." : "Send to n8n"}
          </button>
        </div>

        <div className="mt-3 text-[11px] text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3">
          <p className="font-semibold text-gray-600 mb-1">One-time setup</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Start n8n at <code className="bg-white px-1 rounded">http://localhost:5678</code>.</li>
            <li>Put <code className="bg-white px-1 rounded">N8N_URL</code> and <code className="bg-white px-1 rounded">N8N_API_KEY</code> in <code className="bg-white px-1 rounded">server/.env</code>.</li>
            <li>Restart the FlowArchitect backend.</li>
            <li>Generate a workflow. FlowArchitect creates it in n8n and activates it after generation.</li>
          </ol>
        </div>

        {deployError && (
          <div className="mt-3 flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{deployError}</span>
          </div>
        )}

        {deployResult && (
          <div className="mt-3 flex items-start gap-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
            <Check size={14} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{deployResult.activated ? "Workflow created and activated in n8n." : deployResult.executionDetail}</p>
              <a
                href={deployResult.editorUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold underline"
              >
                Open in n8n <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        <p className="text-[11px] text-gray-400 mt-2">
          FlowArchitect creates and activates the workflow but does not auto-run it. This prevents an accidental email, API call, or database change immediately after generation.
        </p>
      </div>

      <div className="mt-4 bg-gray-900 rounded-xl p-3 max-h-40 overflow-y-auto">
        <pre className="text-[10px] text-violet-200 leading-relaxed whitespace-pre-wrap break-all">
          {JSON.stringify(n8nJson, null, 2)}
        </pre>
      </div>
    </div>
  );
}
