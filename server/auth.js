import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { readUsers, writeUsers } from "./db.js";

// Dev fallback only — set a real JWT_SECRET env var before deploying this
// anywhere other than your own machine.
const JWT_SECRET = process.env.JWT_SECRET || "dev-only-secret-change-me";
const TOKEN_EXPIRY = "7d";
const RESET_TOKEN_TTL_MS = 1000 * 60 * 30; // 30 minutes
const OTP_TTL_MS = 1000 * 60 * 5; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_WINDOW_MS = 1000 * 60 * 10;
const otpRequests = new Map();

function createOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function canSendOtp(email) {
  const now = Date.now();
  const recent = otpRequests.get(email);
  if (recent && now - recent < OTP_RESEND_WINDOW_MS) return false;
  otpRequests.set(email, now);
  return true;
}

async function sendOtpEmail(user, otp, purpose) {
  const subject = purpose === "registration" ? "Verify your FlowArchitect AI account" : "Your FlowArchitect AI login OTP";
  const text = `Your FlowArchitect AI OTP is ${otp}. It expires in 5 minutes. If you did not request this, ignore this email.`;

  // Optional real email delivery. Without SMTP configuration, the OTP is
  // printed only in the server terminal so the project remains runnable locally.
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "FlowArchitect AI <onboarding@resend.dev>",
        to: [user.email], subject, text,
      }),
    });
    if (!response.ok) throw new Error("OTP email could not be sent. Check the email provider configuration.");
    return { delivered: true, provider: "resend" };
  }

  console.log(`\n[FlowArchitect DEV OTP] ${purpose} OTP for ${user.email}: ${otp} (expires in 5 minutes)\n`);
  return { delivered: false, devMode: true };
}

async function issueOtp(user, purpose) {
  const email = user.email.toLowerCase();
  if (!canSendOtp(email)) {
    throw new Error("Please wait a few minutes before requesting another OTP.");
  }
  const otp = createOtp();
  user.otpHash = hashValue(otp);
  user.otpExpires = Date.now() + OTP_TTL_MS;
  user.otpAttempts = 0;
  user.otpPurpose = purpose;
  const result = await sendOtpEmail(user, otp, purpose);
  return result;
}

function verifyOtp(user, otp, purpose) {
  if (!user || user.otpPurpose !== purpose || !user.otpHash || !user.otpExpires) {
    return { ok: false, error: "No active OTP. Please request a new one." };
  }
  if (user.otpExpires < Date.now()) return { ok: false, error: "OTP expired. Please request a new one." };
  if ((user.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) return { ok: false, error: "Too many incorrect attempts. Please request a new OTP." };
  user.otpAttempts = (user.otpAttempts || 0) + 1;
  if (hashValue(String(otp).trim()) !== user.otpHash) return { ok: false, error: "Incorrect OTP." };
  user.otpHash = null;
  user.otpExpires = null;
  user.otpAttempts = 0;
  user.otpPurpose = null;
  return { ok: true };
}

const router = Router();

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body || {};

  if (!name?.trim() || !isValidEmail(email || "") || !password || password.length < 8) {
    return res.status(400).json({
      error: "Name, a valid email, and a password of at least 8 characters are required.",
    });
  }

  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString(),
    resetTokenHash: null,
    resetTokenExpires: null,
    emailVerified: false,
    otpHash: null,
    otpExpires: null,
    otpAttempts: 0,
    otpPurpose: null,
  };

  try {
    const delivery = await issueOtp(user, "registration");
    users.push(user);
    writeUsers(users);
    res.status(201).json({ otpRequired: true, user: publicUser(user), delivery });
  } catch (err) {
    res.status(429).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email || "") || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const invalidMessage = { error: "Invalid email or password." };
  if (!user) return res.status(401).json(invalidMessage);
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json(invalidMessage);
  if (!user.emailVerified) {
    try {
      const delivery = await issueOtp(user, "registration");
      writeUsers(users);
      return res.json({ otpRequired: true, verification: "registration", user: publicUser(user), delivery });
    } catch (err) {
      return res.status(429).json({ error: err.message });
    }
  }
  try {
    const delivery = await issueOtp(user, "login");
    writeUsers(users);
    res.json({ otpRequired: true, verification: "login", user: publicUser(user), delivery });
  } catch (err) {
    res.status(429).json({ error: err.message });
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp, purpose } = req.body || {};
  if (!isValidEmail(email || "") || !/^\d{6}$/.test(String(otp || ""))) {
    return res.status(400).json({ error: "Enter the 6-digit OTP sent to your email." });
  }
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(400).json({ error: "Invalid verification request." });
  const expectedPurpose = purpose === "registration" ? "registration" : "login";
  const result = verifyOtp(user, otp, expectedPurpose);
  if (!result.ok) {
    writeUsers(users);
    return res.status(400).json({ error: result.error });
  }
  if (expectedPurpose === "registration") user.emailVerified = true;
  writeUsers(users);
  res.json({ token: signToken(user), user: publicUser(user) });
});

router.post("/resend-otp", async (req, res) => {
  const { email, purpose } = req.body || {};
  if (!isValidEmail(email || "")) return res.status(400).json({ error: "Enter a valid email address." });
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return res.status(400).json({ error: "Invalid verification request." });
  try {
    const delivery = await issueOtp(user, purpose === "registration" ? "registration" : "login");
    writeUsers(users);
    res.json({ message: "A new OTP has been sent.", delivery });
  } catch (err) {
    res.status(429).json({ error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === (email || "").toLowerCase());

  // Respond identically whether or not the account exists — otherwise this
  // endpoint becomes a way to check which emails are registered.
  const genericResponse = { message: "If an account exists for that email, a reset link has been generated." };
  if (!user) return res.json(genericResponse);

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.resetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.resetTokenExpires = Date.now() + RESET_TOKEN_TTL_MS;
  writeUsers(users);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

  // TODO: send this via a real email provider (nodemailer + Resend/SendGrid,
  // or Gmail SMTP with an app password) once you have one set up. Until
  // then, the link is logged here AND returned directly in the response so
  // the whole flow can be tested without any email service configured.
  console.log(`Password reset link for ${user.email}: ${resetUrl}`);

  res.json({ ...genericResponse, devResetUrl: resetUrl });
});

router.post("/reset-password", async (req, res) => {
  const { email, token, newPassword } = req.body || {};
  if (!email || !token || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      error: "Email, token, and a new password of at least 8 characters are required.",
    });
  }

  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const tokenValid =
    user &&
    user.resetTokenHash &&
    user.resetTokenHash === tokenHash &&
    user.resetTokenExpires &&
    user.resetTokenExpires > Date.now();

  if (!tokenValid) {
    return res.status(400).json({ error: "This reset link is invalid or has expired. Request a new one." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetTokenHash = null;
  user.resetTokenExpires = null;
  writeUsers(users);

  res.json({ message: "Password updated. You can now log in." });
});

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Not authenticated." });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again." });
  }
}

router.get("/me", authMiddleware, (req, res) => {
  const users = readUsers();
  const user = users.find((u) => u.id === req.userId);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ user: publicUser(user) });
});

export default router;
