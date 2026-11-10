import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Info } from "lucide-react";
import * as authClient from "../utils/authClient";
import { AuthLayout, Field, ErrorBanner, SuccessBanner } from "../components/auth/AuthUI";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setSubmitting(true);
    try {
      const data = await authClient.forgotPassword({ email });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your account email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} autoComplete="email" />

        {error && <ErrorBanner message={error} />}
        {result && <SuccessBanner message={result.message} />}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          {submitting ? "Sending..." : "Send Reset Link"}
          <ArrowRight size={18} />
        </button>
      </form>

      {result?.devResetUrl && (
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <Info size={14} className="shrink-0 mt-0.5 text-gray-400" />
          <div>
            <p className="font-semibold text-gray-600 mb-1">Dev mode — no email service is wired up yet</p>
            <p className="mb-1.5">
              This link would normally arrive by email. For now, here it is directly so you can test the flow:
            </p>
            <Link to={result.devResetUrl.replace(window.location.origin, "")} className="text-violet-600 font-semibold break-all underline">
              {result.devResetUrl}
            </Link>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        Remembered it?{" "}
        <Link to="/login" className="text-violet-600 font-semibold hover:text-violet-700">
          Back to login
        </Link>
      </p>
    </AuthLayout>
  );
}
