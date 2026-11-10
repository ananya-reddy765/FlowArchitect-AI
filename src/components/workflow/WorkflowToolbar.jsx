import { useReactFlow } from "@xyflow/react";
import {
  Plus,
  Save,
  Play,
  ShieldCheck,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Download,
} from "lucide-react";

export default function WorkflowToolbar({
  onAddNodeClick,
  onSave,
  onRun,
  onValidate,
  onUndo,
  onRedo,
  onExport,
  canUndo,
  canRedo,
  isRunning,
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const buttonClass =
    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 hover:border-violet-400 hover:bg-violet-50 transition disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed";

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border-b border-gray-200 px-4 py-2">
      <button onClick={onAddNodeClick} className={`${buttonClass} !border-violet-300 text-violet-700`}>
        <Plus size={15} /> Add Node
      </button>

      <button onClick={onSave} className={buttonClass}>
        <Save size={15} /> Save
      </button>

      <button onClick={onRun} disabled={isRunning} className={buttonClass}>
        <Play size={15} /> {isRunning ? "Running..." : "Run"}
      </button>

      <button onClick={onValidate} className={buttonClass}>
        <ShieldCheck size={15} /> Validate
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={onUndo} disabled={!canUndo} className={buttonClass}>
        <Undo2 size={15} /> Undo
      </button>
      <button onClick={onRedo} disabled={!canRedo} className={buttonClass}>
        <Redo2 size={15} /> Redo
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      <button onClick={() => zoomIn()} className={buttonClass}>
        <ZoomIn size={15} />
      </button>
      <button onClick={() => zoomOut()} className={buttonClass}>
        <ZoomOut size={15} />
      </button>
      <button onClick={() => fitView()} className={buttonClass}>
        <Maximize size={15} />
      </button>

      <div className="flex-1" />

      <button onClick={onExport} className={`${buttonClass} !border-violet-300 text-violet-700`}>
        <Download size={15} /> Export JSON
      </button>
    </div>
  );
}
