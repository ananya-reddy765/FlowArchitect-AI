import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";
import * as authClient from "../utils/authClient";
import { AuthLayout, Field, ErrorBanner, SuccessBanner } from "../components/auth/AuthUI";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const linkLooksValid = Boolean(token && email);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await authClient.resetPassword({ email, token, newPassword });
      setDone(true);
      setTimeout(() => navigate("/login", { replace: true }), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!linkLooksValid) {
    return (
      <AuthLayout title="Invalid reset link">
        <ErrorBanner message="This link is missing its token or email — request a new one." />
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/forgot-password" className="text-violet-600 font-semibold hover:text-violet-700">
            Request a new reset link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Set a new password" subtitle={`Resetting the password for ${email}.`}>
      {done ? (
        <SuccessBanner message="Password updated. Taking you to login..." />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            icon={Lock}
            type="password"
            placeholder="New password (min. 8 characters)"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            minLength={8}
          />
          <Field
            icon={Lock}
            type="password"
            placeholder="Confirm new password"
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
            {submitting ? "Updating..." : "Update Password"}
            <ArrowRight size={18} />
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
