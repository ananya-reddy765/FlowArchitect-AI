const AUTH_BASE = "http://localhost:4000/api/auth";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${AUTH_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
  } catch {
    throw new Error("Couldn't reach the server. Make sure it's running: cd server && npm start");
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error("The server didn't return a valid response.");
  }

  if (!res.ok) throw new Error(data?.error || "Something went wrong.");
  return data;
}

export function register({ name, email, password }) {
  return request("/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
}

export function login({ email, password }) {
  return request("/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export function verifyOtp({ email, otp, purpose }) {
  return request("/verify-otp", { method: "POST", body: JSON.stringify({ email, otp, purpose }) });
}

export function resendOtp({ email, purpose }) {
  return request("/resend-otp", { method: "POST", body: JSON.stringify({ email, purpose }) });
}

export function forgotPassword({ email }) {
  return request("/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export function resetPassword({ email, token, newPassword }) {
  return request("/reset-password", { method: "POST", body: JSON.stringify({ email, token, newPassword }) });
}

export function fetchMe(token) {
  return request("/me", { headers: { Authorization: `Bearer ${token}` } });
}
