import { ArrowRight, Bot, CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getWorkflowTemplates } from "../data/workflowTemplates";

const templates = getWorkflowTemplates();

export default function Templates() {
  const navigate = useNavigate();

  function useTemplate(template) {
    navigate("/create-workflow", { state: { template } });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-white">
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/create-workflow")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-violet-600 transition"
          >
            <ArrowRight size={15} className="rotate-180" />
            Create Workflow
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Bot size={16} color="white" />
            </div>
            <span className="font-semibold text-gray-800">Workflow Templates</span>
          </div>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 text-sm font-semibold">
            <Sparkles size={15} />
            Ready-made workflow blueprints
          </div>
          <h1 className="text-4xl font-extrabold mt-4">Choose a Template</h1>
          <p className="text-gray-600 mt-3 text-lg">
            Start with a proven workflow structure instead of building from scratch.
            Select a template and FlowArchitect AI will open it in the workflow builder,
            where you can edit, validate, learn, and export it.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
          {templates.map((template) => (
            <div
              key={template.name}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-violet-200 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <Bot size={21} />
              </div>
              <h2 className="font-bold text-lg text-gray-900 mt-4">{template.name}</h2>
              <p className="text-gray-500 text-sm mt-2 leading-6 flex-1">{template.description}</p>

              <div className="flex items-center gap-2 text-xs text-gray-500 mt-5">
                <CheckCircle2 size={15} className="text-green-500" />
                Ready to customize
              </div>

              <button
                onClick={() => useTemplate(template)}
                className="mt-4 w-full bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
              >
                Use Template
                <ArrowRight size={17} />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
