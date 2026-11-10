import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What is FlowArchitect AI?",
    answer:
      "FlowArchitect AI is an AI-powered platform that converts natural language workflow descriptions into intelligent, production-ready n8n automation workflows. It simplifies workflow creation by eliminating the need to manually design complex automation pipelines.",
  },
  {
    question: "Who can use FlowArchitect AI?",
    answer:
      "FlowArchitect AI is designed for students, developers, businesses, automation engineers, educators, and anyone interested in creating automation workflows without extensive technical knowledge.",
  },
  {
    question: "How does FlowArchitect AI generate workflows?",
    answer:
      "The platform analyzes the user's requirements using Natural Language Processing (NLP), identifies triggers, actions, conditions, and integrations, creates a workflow blueprint, validates it, and finally generates an n8n-compatible workflow.",
  },
  {
    question: "Do I need programming knowledge to use this platform?",
    answer:
      "No. Users simply describe their workflow in plain English. The AI understands the request and automatically generates the workflow without requiring coding knowledge.",
  },
  {
    question: "What technologies are used in this project?",
    answer:
      "FlowArchitect AI is built using React.js, Tailwind CSS, Node.js, Express.js, Artificial Intelligence, Natural Language Processing (NLP), and n8n workflow automation concepts.",
  },
  {
    question: "Why use AI instead of traditional rule-based automation?",
    answer:
      "Traditional automation requires manually defining every rule. AI understands user intent, handles more complex scenarios, and dynamically generates workflows, making automation faster, smarter, and easier to use.",
  },
  {
    question: "Can users modify the generated workflow?",
    answer:
      "Yes. After the workflow is generated, users can review, customize, and refine it before exporting it for deployment in n8n.",
  },
  {
    question: "Is the generated workflow compatible with n8n?",
    answer:
      "Yes. The generated workflow is designed to follow the structure of n8n workflows, making it easy to export and import into the n8n automation platform.",
  },
  {
    question: "How does the system ensure workflow accuracy?",
    answer:
      "Before export, the workflow is validated to check node connections, logical flow, required configurations, and possible errors to ensure reliable execution.",
  },
  {
    question: "What problem does FlowArchitect AI solve?",
    answer:
      "Creating automation workflows manually can be time-consuming and challenging, especially for beginners. FlowArchitect AI simplifies this process by allowing users to describe their ideas in natural language and automatically generating structured workflows.",
  },
  {
    question: "What makes FlowArchitect AI different from existing workflow builders?",
    answer:
      "Unlike traditional drag-and-drop workflow builders that require manual configuration, FlowArchitect AI allows users to simply describe their automation in plain English. The AI then analyzes the request and automatically creates a structured workflow, significantly reducing development time.",
  },
  {
    question: "What future enhancements are planned?",
    answer:
      "Future improvements include support for additional automation platforms, voice-based workflow generation, collaborative editing, AI-powered workflow optimization, real-time workflow monitoring, and integration with more cloud services.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
  id="faq"
  className="py-24 scroll-mt-24"
>
      <div className="max-w-5xl mx-auto px-6">

        {/* Heading */}

        <div className="text-center mb-14">

          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-5 py-2 rounded-full font-medium">
            <HelpCircle size={18} />
            Frequently Asked Questions
          </div>

          <h2 className="text-5xl font-extrabold mt-6">
            Everything You Need to Know
          </h2>

          <p className="text-gray-600 mt-5 text-lg max-w-3xl mx-auto">
            Find answers to common questions about FlowArchitect AI,
            workflow generation, AI automation, and platform capabilities.
          </p>

        </div>

        {/* FAQ Cards */}

        <div className="space-y-5">

          {faqs.map((faq, index) => {

            const active = openIndex === index;

            return (

              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden
                ${
                  active
                    ? "border-violet-500 shadow-lg bg-white"
                    : "border-gray-200 bg-white hover:border-violet-300"
                }`}
              >

                <button
                  onClick={() =>
                    setOpenIndex(active ? -1 : index)
                  }
                  className="w-full flex items-center justify-between p-6"
                >

                  <h3 className="text-left text-lg font-semibold text-gray-800">
                    {faq.question}
                  </h3>

                  {active ? (
                    <ChevronUp className="text-violet-600" />
                  ) : (
                    <ChevronDown className="text-gray-500" />
                  )}

                </button>

                <div
                  className={`transition-all duration-500 overflow-hidden ${
                    active
                      ? "max-h-60 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >

                  <div className="px-6 pb-6 border-t border-gray-100">

                    <p className="text-gray-600 leading-8 mt-4">
                      {faq.answer}
                    </p>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>
    </section>
  );
}