import { ListChecks, CircleDot, CheckCircle2, XCircle } from "lucide-react";

const statusIcon = {
  waiting: <CircleDot size={15} className="text-gray-300" />,
  running: <CircleDot size={15} className="text-yellow-500 animate-pulse" />,
  success: <CheckCircle2 size={15} className="text-green-500" />,
  error: <XCircle size={15} className="text-red-500" />,
};

const statusText = {
  waiting: "Waiting",
  running: "Running",
  success: "Success",
  error: "Error",
};

export default function ExecutionPanel({ log }) {
  if (!log || log.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <ListChecks size={16} className="text-violet-600" />
        <h3 className="font-bold text-gray-800">Execution Log</h3>
      </div>

      <div className="space-y-2">
        {log.map((entry, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0"
          >
            <div className="flex items-center gap-2">
              {statusIcon[entry.status]}
              <span className="text-gray-700">{entry.label}</span>
            </div>
            <span
              className={`font-medium ${
                entry.status === "success"
                  ? "text-green-600"
                  : entry.status === "error"
                  ? "text-red-600"
                  : "text-gray-400"
              }`}
            >
              {statusText[entry.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
