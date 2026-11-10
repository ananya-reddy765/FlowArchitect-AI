import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout, Field, ErrorBanner } from "../components/auth/AuthUI";

export default function Register() {
  const { register, verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState("details");
  const [otp, setOtp] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name, email, password });
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "otp") {
    async function handleOtp(e) {
      e.preventDefault(); setError(null); setSubmitting(true);
      try { await verifyOtp({ email, otp, purpose: "registration" }); navigate("/dashboard", { replace: true }); }
      catch (err) { setError(err.message); } finally { setSubmitting(false); }
    }
    async function resend() { try { await resendOtp({ email, purpose: "registration" }); setError(null); } catch (err) { setError(err.message); } }
    return (
      <AuthLayout title="Verify your email" subtitle={`Enter the 6-digit OTP sent to ${email}. It expires in 5 minutes.`}>
        <form onSubmit={handleOtp} className="space-y-4">
          <Field icon={ShieldCheck} inputMode="numeric" placeholder="6-digit OTP" value={otp} onChange={setOtp} autoComplete="one-time-code" />
          {error && <ErrorBanner message={error} />}
          <button type="submit" disabled={submitting || otp.length !== 6} className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2">{submitting ? "Verifying..." : "Verify & Create Account"}<ArrowRight size={18}/></button>
          <button type="button" onClick={resend} className="w-full text-sm text-violet-600 font-semibold">Resend OTP</button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start turning ideas into automated workflows.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field icon={User} placeholder="Full name" value={name} onChange={setName} autoComplete="name" />
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} autoComplete="email" />
        <Field
          icon={Lock}
          type="password"
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
        />
        <Field
          icon={Lock}
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={8}
        />

        {error && <ErrorBanner message={error} />}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          {submitting ? "Creating account..." : "Create Account"}
          <ArrowRight size={18} />
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
