import {
  ArrowRight,
  Sparkles,
  Brain,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import heroImage from "../assets/hero-illustration.png";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-violet-50 to-white">

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-6">

        <div className="flex items-center gap-3">
          <div className="bg-violet-600 p-3 rounded-xl text-white">
            <Workflow size={22} />
          </div>

          <div>
            <h2 className="font-bold text-2xl">
              FlowArchitect AI
            </h2>

            <p className="text-sm text-gray-500">
              AI Workflow Architect
            </p>
          </div>
        </div>

        <div className="hidden md:flex gap-8 text-gray-700">
          <a href="#">Features</a>
          <a href="#">How it Works</a>
          <a href="#">Demo</a>
          <a href="#">FAQ</a>
        </div>

        <div className="flex items-center gap-5">
          <button className="text-gray-700">
            Login
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-violet-600 hover:bg-violet-700 transition text-white px-6 py-3 rounded-xl flex items-center gap-2"
          >
            Get Started
            <ArrowRight size={18} />
          </button>
        </div>

      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center px-6 py-12">

        {/* Left Side */}
        <div>

          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-4 py-2 rounded-full">
            <Sparkles size={18} />
            AI Powered Automation
          </div>

          <h1 className="text-6xl font-black leading-tight mt-8">
            Turn <span className="text-violet-600">Ideas</span>
            <br />
            into Intelligent
            <br />
            <span className="text-violet-600">Workflows</span>
          </h1>

          <p className="mt-8 text-gray-600 text-lg leading-8">
            FlowArchitect AI converts workflow ideas into intelligent automation
            pipelines using AI and Natural Language Processing. Simply describe
            your workflow in plain English and instantly receive a
            production-ready n8n workflow.
          </p>

          <div className="flex gap-4 mt-10">
            <button
              onClick={() => navigate("/dashboard")}
              className="bg-violet-600 hover:bg-violet-700 transition text-white px-7 py-4 rounded-xl font-semibold"
            >
              Get Started
            </button>

            <button className="border border-gray-300 px-7 py-4 rounded-xl">
              View Demo
            </button>
          </div>

          <div className="grid grid-cols-3 gap-5 mt-12">

            <Feature
              icon={<Brain size={20} />}
              title="AI Powered"
              sub="Smart Analysis"
            />

            <Feature
              icon={<Workflow size={20} />}
              title="n8n Ready"
              sub="Export JSON"
            />

          </div>

        </div>

        {/* Right Side - AI Illustration */}
        <div className="flex justify-center items-center">

          <img
            src={heroImage}
            alt="FlowArchitect AI"
            className="
              w-full
              max-w-[760px]
              object-contain
              transition-all
              duration-700
              hover:scale-105
              drop-shadow-[0_25px_60px_rgba(124,58,237,0.25)]
            "
          />

        </div>

      </div>

    </section>
  );
}

function Feature({ icon, title, sub }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-lg transition">

      <div className="text-violet-600">
        {icon}
      </div>

      <h3 className="font-semibold mt-3">
        {title}
      </h3>

      <p className="text-sm text-gray-500">
        {sub}
      </p>

    </div>
  );
}