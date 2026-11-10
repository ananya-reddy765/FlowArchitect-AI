import { Settings } from "lucide-react";
import { nodeDefinitions } from "../../data/nodeDefinitions";

export default function NodeConfigPanel({ node, onChangeConfig }) {
  if (!node) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-gray-400">
        <Settings size={22} className="mx-auto mb-2" />
        <p className="text-sm">Select a node to configure it.</p>
      </div>
    );
  }

  const def = nodeDefinitions[node.data.nodeType];
  const config = node.data.config || {};

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <Settings size={16} className="text-violet-600" />
        <h3 className="font-bold text-gray-800">Node Configuration</h3>
      </div>

      <h4 className="text-lg font-bold mt-3">{node.data.label}</h4>
      <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
        Node Type: {node.data.category}
      </p>
      <p className="text-sm text-gray-500 mt-2">Action: {node.data.action}</p>

      <div className="mt-5 space-y-4">
        {def.configFields.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">
              {field.label}
            </label>

            {field.type === "select" ? (
              <select
                value={config[field.key] || ""}
                onChange={(e) => onChangeConfig(field.key, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
              >
                <option value="">Select...</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={config[field.key] || ""}
                onChange={(e) => onChangeConfig(field.key, e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-violet-400"
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 mt-5">
        These settings are stored with the workflow but are frontend-only —
        no real credentials or API calls are made yet.
      </p>
    </div>
  );
}
