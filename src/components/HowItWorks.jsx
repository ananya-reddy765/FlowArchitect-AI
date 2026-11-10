import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  GitBranch,
  Scale,
  Workflow,
  ShieldCheck,
  Download,
} from "lucide-react";

import workflowImage from "../assets/workflow-sketch.png";

const steps = [
  {
    number: "01",
    title: "User Requirements",
    description: "Describe your workflow in natural language.",
    details:
      "The process begins when the user describes the desired automation in simple English. No programming knowledge is required. The AI reads the request and prepares it for processing.",
    example:
      'Example:\n"Send reminder emails to students whose attendance is below 75%."',
    icon: <Sparkles size={22} />,
  },

  {
    number: "02",
    title: "AI Requirement Analysis",
    description: "AI understands triggers, actions and conditions.",
    details:
      "Using Natural Language Processing (NLP), the AI identifies the workflow trigger, required actions, conditions, integrations, and expected output.",
    example:
      "Detected:\n• Trigger → Attendance Updated\n• Condition → Attendance < 75%\n• Action → Send Email",
    icon: <Brain size={22} />,
  },

  {
    number: "03",
    title: "Workflow Blueprint",
    description: "A structured automation flow is generated.",
    details:
      "The extracted information is transformed into a logical workflow blueprint. This serves as the foundation before generating the actual automation.",
    example:
      "Blueprint:\nAttendance → Check Condition → Send Email → End",
    icon: <GitBranch size={22} />,
  },

  {
    number: "04",
    title: "AI vs Rule-Based Decision",
    description: "System decides where AI is required.",
    details:
      "The platform intelligently decides whether a task should be executed using AI reasoning or standard rule-based automation for maximum efficiency.",
    example:
      "Rule-Based:\nAttendance < 75%\n\nAI:\nGenerate personalized email content",
    icon: <Scale size={22} />,
  },

  {
    number: "05",
    title: "n8n Integration",
    description: "Workflow is converted into n8n nodes.",
    details:
      "Each workflow step is mapped into compatible n8n nodes. Connections are automatically created to build a complete executable workflow.",
    example:
      "Generated Nodes:\nCron → Google Sheets → IF → Gmail → End",
    icon: <Workflow size={22} />,
  },

  {
    number: "06",
    title: "Validation",
    description: "Workflow is checked before export.",
    details:
      "Before exporting, the workflow is validated for missing nodes, invalid configurations, broken connections, and logical errors.",
    example:
      "Validation Report:\n✓ Nodes Connected\n✓ Credentials Verified\n✓ No Errors",
    icon: <ShieldCheck size={22} />,
  },

  {
    number: "07",
    title: "Final Workflow",
    description: "Download JSON or open directly in n8n.",
    details:
      "After successful validation, the workflow is ready for deployment. Users can preview it, download the JSON file, or import it directly into n8n.",
    example:
      "Available Options:\n• Preview Workflow\n• Download JSON\n• Import into n8n",
    icon: <Download size={22} />,
  },
];

export default function HowItWorks() {
  const [open, setOpen] = useState(0);

  return (
    <section
  id="how-it-works"
  className="py-24 bg-gradient-to-b from-white to-violet-50 scroll-mt-24"
>
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">

          <span className="bg-violet-100 text-violet-700 px-4 py-2 rounded-full font-medium">
            How It Works
          </span>

          <h2 className="text-5xl font-extrabold mt-6">
            How Our System Works
          </h2>

          <p className="text-gray-600 mt-5 max-w-3xl mx-auto text-lg">
            FlowArchitect AI converts your natural language idea into a
            production-ready n8n workflow through seven intelligent stages.
          </p>

        </div>

        <div className="grid lg:grid-cols-2 gap-16 mt-16 items-start">

          {/* Left */}

          <div className="sticky top-24">

            <div className="bg-white rounded-3xl shadow-xl border p-6">

              <img
                src={workflowImage}
                alt="Workflow Sketch"
                className="w-full rounded-2xl"
              />

            </div>

          </div>

          {/* Right */}

          <div className="space-y-5">

            {steps.map((step, index) => {

              const active = open === index;

              return (

                <div
                  key={index}
                  className={`rounded-3xl border overflow-hidden transition-all duration-300 ${
                    active
                      ? "border-violet-500 shadow-xl bg-white"
                      : "border-gray-200 bg-white hover:border-violet-300 hover:shadow-lg"
                  }`}
                >

                  <button
                    onClick={() => setOpen(active ? -1 : index)}
                    className="w-full flex justify-between items-center p-6"
                  >

                    <div className="flex items-center gap-5">

                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          active
                            ? "bg-violet-600 text-white"
                            : "bg-violet-100 text-violet-600"
                        }`}
                      >
                        {step.icon}
                      </div>

                      <div className="text-left">

                        <span className="text-violet-600 font-bold text-sm">
                          {step.number}
                        </span>

                        <h3 className="text-2xl font-bold">
                          {step.title}
                        </h3>

                        <p className="text-gray-500">
                          {step.description}
                        </p>

                      </div>

                    </div>

                    {active ? <ChevronUp /> : <ChevronDown />}

                  </button>

                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      active
                        ? "max-h-[500px] opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >

                    <div className="px-6 pb-6">

                      <div className="ml-[74px] border-l-4 border-violet-500 pl-5">

                        <h4 className="font-bold text-lg text-violet-700">
                          What happens in this step?
                        </h4>

                        <p className="mt-3 text-gray-700 leading-7">
                          {step.details}
                        </p>

                        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">

                          <h5 className="font-semibold text-violet-700 mb-3">
                            Example
                          </h5>

                          <p className="whitespace-pre-line text-gray-700">
                            {step.example}
                          </p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      </div>
    </section>
  );
}