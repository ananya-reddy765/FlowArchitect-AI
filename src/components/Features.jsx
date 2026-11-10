import { Brain, Workflow, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <Brain size={30} />,
    title: "AI Requirement Analysis",
    description:
      "Understands user requirements using Natural Language Processing.",
  },
  {
    icon: <Workflow size={30} />,
    title: "n8n Workflow Generation",
    description:
      "Automatically creates production-ready n8n workflows.",
  },
  {
    icon: <ShieldCheck size={30} />,
    title: "Validation",
    description:
      "Checks workflow logic before exporting to ensure accuracy.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-6">

        <div className="text-center">
          <h2 className="text-5xl font-bold">
            Features
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Powerful AI features that transform simple ideas into intelligent automation workflows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-violet-50 rounded-3xl p-8 border hover:shadow-xl transition"
            >
              <div className="w-14 h-14 rounded-full bg-violet-600 text-white flex items-center justify-center">
                {feature.icon}
              </div>

              <h3 className="text-2xl font-bold mt-6">
                {feature.title}
              </h3>

              <p className="text-gray-600 mt-4 leading-7">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}