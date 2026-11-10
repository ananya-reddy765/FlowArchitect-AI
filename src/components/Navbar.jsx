import { Bot, ArrowRight, LogOut, UserCircle, Settings, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center">
            <Bot size={22} color="white" />
          </div>

          <div>
            <h1 className="font-bold text-xl">
              FlowArchitect AI
            </h1>

            <p className="text-xs text-gray-500">
              AI Workflow Architect
            </p>
          </div>
        </a>

        {/* Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-gray-700">

          <a href="#how-it-works" className="hover:text-violet-600 transition">
            How It Works
          </a>

          <a href="#demo" className="hover:text-violet-600 transition">
            Demo
          </a>

          <a href="#faq" className="hover:text-violet-600 transition">
            FAQ
          </a>

        </div>

        {/* Buttons */}
        <div className="flex items-center gap-4">

          {user ? (
            <>
              <span className="hidden sm:block text-sm text-gray-600">
                Hi, <span className="font-semibold text-gray-800">{user.name}</span>
              </span>

              <button onClick={() => navigate("/dashboard")} className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl flex items-center gap-2">Dashboard <ArrowRight size={18} /></button>
              <div className="relative">
                <button onClick={() => setOpen(!open)} className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 hover:bg-gray-50">
                  <UserCircle size={22} className="text-violet-600" />
                  <span className="hidden md:block text-sm font-semibold">{user.name}</span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-2xl p-2">
                    <div className="px-3 py-3 border-b border-gray-100"><p className="font-semibold">{user.name}</p><p className="text-xs text-gray-500 break-all">{user.email}</p></div>
                    <button onClick={() => navigate("/dashboard")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex gap-2 items-center"><Settings size={16}/> Dashboard & Profile</button>
                    <button onClick={() => navigate("/security")} className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex gap-2 items-center"><ShieldCheck size={16}/> Security & API Keys</button>
                    <button onClick={logout} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 flex gap-2 items-center"><LogOut size={16}/> Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="font-medium text-gray-700 hover:text-violet-600"
              >
                Login
              </button>

              <button
                onClick={() => navigate("/register")}
                className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-3 rounded-xl flex items-center gap-2"
              >
                Get Started
                <ArrowRight size={18}/>
              </button>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}
