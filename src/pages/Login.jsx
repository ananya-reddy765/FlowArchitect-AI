import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout, Field, ErrorBanner } from "../components/auth/AuthUI";

export default function Login() {
  const { login, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("password");
  const [otp, setOtp] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await login({ email, password });
      if (data.otpRequired) { setStep("otp"); return; }
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    async function handleOtp(e) {
      e.preventDefault(); setError(null); setSubmitting(true);
      try { await verifyOtp({ email, otp, purpose: "login" }); navigate(location.state?.from || "/dashboard", { replace: true }); }
      catch (err) { setError(err.message); } finally { setSubmitting(false); }
    }
    async function resend() { try { await resendOtp({ email, purpose: "login" }); setError(null); } catch (err) { setError(err.message); } }
    return (
      <AuthLayout title="Two-step verification" subtitle={`Enter the 6-digit OTP sent to ${email}. It expires in 5 minutes.`}>
        <form onSubmit={handleOtp} className="space-y-4">
          <Field icon={ShieldCheck} inputMode="numeric" placeholder="6-digit OTP" value={otp} onChange={setOtp} autoComplete="one-time-code" />
          {error && <ErrorBanner message={error} />}
          <button type="submit" disabled={submitting || otp.length !== 6} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">{submitting ? "Verifying..." : "Verify & Log In"}<ArrowRight size={18}/></button>
          <button type="button" onClick={resend} className="w-full text-sm text-violet-600 font-semibold">Resend OTP</button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to keep building your workflows.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} autoComplete="email" />
        <Field
          icon={Lock}
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            Forgot password?
          </Link>
        </div>

        {error && <ErrorBanner message={error} />}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          {submitting ? "Logging in..." : "Log In"}
          <ArrowRight size={18} />
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-violet-600 font-semibold hover:text-violet-700">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}
