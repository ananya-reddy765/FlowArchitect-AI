import { ClipboardList } from "lucide-react";

const topicsByCategory = {
  trigger: ["Triggers", "Events"],
  action: ["Data flow"],
  logic: ["Conditions", "Branching"],
};

const topicsByNodeType = {
  "google-drive": ["File handling"],
  dropbox: ["File handling"],
  slack: ["Notifications"],
  "send-email": ["Notifications"],
  "slack-notification": ["Notifications"],
  "ai-agent": ["AI"],
  openai: ["AI"],
  gemini: ["AI"],
  "http-request": ["API", "HTTP"],
  "rest-api": ["API", "HTTP"],
  "google-sheets": ["Spreadsheets"],
  postgresql: ["Databases"],
  mysql: ["Databases"],
};

export default function WorkflowSummary({ nodes }) {
  const trigger = nodes.find((n) => n.data.category === "trigger");
  const actions = nodes.filter((n) => n.data.category === "action");
  const logicNodes = nodes.filter((n) => n.data.category === "logic");

  const topics = new Set();
  nodes.forEach((n) => {
    (topicsByCategory[n.data.category] || []).forEach((t) => topics.add(t));
    (topicsByNodeType[n.data.nodeType] || []).forEach((t) => topics.add(t));
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList size={16} className="text-violet-600" />
        <h3 className="font-bold text-gray-800">Workflow Summary</h3>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <p className="font-semibold text-gray-700">Trigger</p>
          <p className="text-gray-500">{trigger ? trigger.data.label : "None yet"}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700">Actions</p>
          {actions.length === 0 ? (
            <p className="text-gray-500">None yet</p>
          ) : (
            <ul className="text-gray-500 list-disc list-inside">
              {actions.map((a) => (
                <li key={a.id}>{a.data.label}</li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="font-semibold text-gray-700">Logic</p>
          <p className="text-gray-500">
            {logicNodes.length > 0
              ? logicNodes.map((l) => l.data.label).join(", ")
              : "None"}
          </p>
        </div>

        <div>
          <p className="font-semibold text-gray-700">Estimated Steps</p>
          <p className="text-gray-500">{nodes.length}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700">Learning Topics</p>
          {topics.size === 0 ? (
            <p className="text-gray-500">None yet</p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-1">
              {[...topics].map((topic) => (
                <span
                  key={topic}
                  className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
