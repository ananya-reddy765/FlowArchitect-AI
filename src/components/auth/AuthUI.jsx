import { Bot, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center">
            <Bot size={22} color="white" />
          </div>
          <div className="text-left">
            <h1 className="font-bold text-xl">FlowArchitect AI</h1>
            <p className="text-xs text-gray-500">AI Workflow Architect</p>
          </div>
        </Link>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="text-gray-500 text-sm mt-1.5 mb-6">{subtitle}</p>}
          {!subtitle && <div className="mb-6" />}
          {children}
        </div>
      </div>
    </div>
  );
}

export function Field({ icon: Icon, label, type = "text", value, onChange, placeholder, autoComplete, minLength }) {
  return (
    <div>
      {label && <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className={`w-full border border-gray-200 rounded-xl py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

export function ErrorBanner({ message }) {
  return (
    <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
      <AlertTriangle size={15} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}

export function SuccessBanner({ message }) {
  return (
    <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
      <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
