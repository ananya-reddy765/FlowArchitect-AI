import { X, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { nodesByGroup } from "../../data/nodeDefinitions";
import { syncN8nNodeLibrary } from "../../utils/n8nNodeSync";

export default function NodePicker({ onAddNode, onClose }) {
  const grouped = nodesByGroup();
  const [query, setQuery] = useState("");

  useEffect(() => {
    syncN8nNodeLibrary();
  }, []);

  const lowerQuery = query.toLowerCase();

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Add a Node</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <Search size={15} className="text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search nodes..."
              className="bg-transparent outline-none text-sm w-full"
              autoFocus
            />
          </div>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {Object.entries(grouped).map(([group, nodes]) => {
            const filtered = nodes.filter((n) =>
              n.label.toLowerCase().includes(lowerQuery)
            );
            if (filtered.length === 0) return null;

            return (
              <div key={group}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {group}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {filtered.map((node) => {
                    const Icon = node.icon;
                    return (
                      <button
                        key={node.key}
                        onClick={() => {
                          onAddNode(node.key);
                          onClose();
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition text-left"
                      >
                        <div className="w-7 h-7 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                          <Icon size={14} />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{node.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
