import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Layers } from "lucide-react";
import { nodesByGroup } from "../../data/nodeDefinitions";
import { syncN8nNodeLibrary } from "../../utils/n8nNodeSync";

export default function NodeLibrary({ onAddNode }) {
  const [openGroup, setOpenGroup] = useState("Triggers");
  const [, setSyncState] = useState(null);
  const grouped = nodesByGroup();

  useEffect(() => {
    syncN8nNodeLibrary().then((result) => setSyncState(result));
  }, []);

  return (
    <aside className="w-full h-full overflow-y-auto bg-white border-r border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={18} className="text-violet-600" />
        <h3 className="font-bold text-gray-800">Node Library</h3>
      </div>

      <div className="space-y-2">
        {Object.entries(grouped).map(([group, nodes]) => {
          const isOpen = openGroup === group;

          return (
            <div key={group} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenGroup(isOpen ? null : group)}
                className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-violet-50 transition text-sm font-semibold text-gray-700"
              >
                {group}
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {isOpen && (
                <div className="p-2 space-y-1">
                  {nodes.map((node) => {
                    const Icon = node.icon;
                    return (
                      <button
                        key={node.key}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/flowarchitect-node", node.key);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onClick={() => onAddNode(node.key)}
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-violet-50 transition text-left"
                        title={node.description}
                      >
                        <div className="w-7 h-7 rounded-md bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                          <Icon size={14} />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{node.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
