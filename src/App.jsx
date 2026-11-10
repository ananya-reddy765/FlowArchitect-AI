import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import Demo from "./components/Demo";
import FAQ from "./components/FAQ";

import Dashboard from "./pages/Dashboard";
import CreateWorkflow from "./pages/CreateWorkflow";
import WorkflowDetails from "./pages/WorkflowDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SecurityInfo from "./pages/SecurityInfo";
import Templates from "./pages/Templates";

function LandingPage() {
  return (
    <>
      <Navbar />

      <Hero />

      <HowItWorks />

      <Demo />

      <FAQ />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/security" element={<ProtectedRoute><SecurityInfo /></ProtectedRoute>} />
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <Templates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-workflow"
        element={
          <ProtectedRoute>
            <CreateWorkflow />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workflow/:id"
        element={
          <ProtectedRoute>
            <WorkflowDetails />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;