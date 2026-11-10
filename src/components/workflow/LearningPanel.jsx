import { GraduationCap } from "lucide-react";
import { nodeDefinitions } from "../../data/nodeDefinitions";

export default function LearningPanel({ node }) {
  if (!node) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center text-gray-400">
        <GraduationCap size={22} className="mx-auto mb-2" />
        <p className="text-sm">Select a node to learn about it.</p>
      </div>
    );
  }

  const def = nodeDefinitions[node.data.nodeType];
  const learn = def.learn;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <GraduationCap size={16} className="text-violet-600" />
        <h3 className="font-bold text-gray-800">Learn This Node</h3>
      </div>

      <h4 className="text-lg font-bold mt-3">{node.data.label}</h4>

      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="font-semibold text-gray-700">What is it?</p>
          <p className="text-gray-500 mt-1">{learn.what}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700">Why use it?</p>
          <p className="text-gray-500 mt-1">{learn.why}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700">Example</p>
          <p className="text-gray-500 mt-1 whitespace-pre-line">{learn.example}</p>
        </div>

        <div>
          <p className="font-semibold text-gray-700">Concepts you learn</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {learn.concepts.map((concept) => (
              <span
                key={concept}
                className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
