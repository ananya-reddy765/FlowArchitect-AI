import { Handle, Position } from "@xyflow/react";
import { X, Pencil } from "lucide-react";
import { nodeDefinitions } from "../../data/nodeDefinitions";

const statusStyles = {
  idle: { ring: "border-gray-200", badge: null },
  waiting: { ring: "border-gray-200", badge: null },
  running: {
    ring: "border-yellow-400 ring-2 ring-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
  success: {
    ring: "border-green-400 ring-2 ring-green-200",
    badge: "bg-green-100 text-green-700",
  },
  error: {
    ring: "border-red-400 ring-2 ring-red-200",
    badge: "bg-red-100 text-red-700",
  },
};

const statusText = {
  running: "Running",
  success: "Success",
  error: "Error",
};

const categoryLabel = {
  trigger: "Trigger",
  action: "Action",
  logic: "Logic",
};

export default function WorkflowNode({ data, id, selected, onEdit, onDelete }) {
  const def = nodeDefinitions[data.nodeType] || {};
  const Icon = def.icon;
  const isIf = data.nodeType === "if";
  const status = statusStyles[data.status] || statusStyles.idle;

  return (
    <div
      className={`bg-white rounded-2xl border-2 shadow-sm p-4 w-[220px] transition-all duration-300 ${
        data.status === "running" ? "animate-pulse" : ""
      } ${selected ? "border-violet-500 shadow-lg" : status.ring}`}
    >
      {/* Target handle (top) — every node except triggers can receive one */}
      {data.category !== "trigger" && (
        <Handle type="target" position={Position.Top} className="!bg-violet-400 !w-2.5 !h-2.5" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
            {Icon && <Icon size={17} />}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wide">
              {categoryLabel[data.category] || "Step"}
            </p>
            <h4 className="font-bold text-sm truncate">{data.label}</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            data-nodrag
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(id);
            }}
            className="text-gray-400 hover:text-violet-600 transition"
            title="Edit node"
          >
            <Pencil size={13} />
          </button>
          <button
            data-nodrag
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(id);
            }}
            className="text-gray-400 hover:text-red-500 transition"
            title="Delete node"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">{data.action}</p>

      {statusText[data.status] && (
        <span
          className={`inline-block mt-2 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${status.badge}`}
        >
          {statusText[data.status]}
        </span>
      )}

      {/* Source handles */}
      {isIf ? (
        <div className="flex justify-between mt-3 text-[10px] font-semibold text-gray-400">
          <span>FALSE</span>
          <span>TRUE</span>
          <Handle
            type="source"
            position={Position.Bottom}
            id="false"
            style={{ left: "25%" }}
            className="!bg-red-400 !w-2.5 !h-2.5"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="true"
            style={{ left: "75%" }}
            className="!bg-green-500 !w-2.5 !h-2.5"
          />
        </div>
      ) : (
        <Handle type="source" position={Position.Bottom} className="!bg-violet-400 !w-2.5 !h-2.5" />
      )}
    </div>
  );
}
