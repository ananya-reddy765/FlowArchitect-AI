// Deploys through the FlowArchitect backend. n8n URL and API key stay
// server-side in server/.env and are never sent from the browser.
export async function deployToN8n({ proxyUrl = "http://localhost:4000", workflow }) {
  const res = await fetch(`${proxyUrl.replace(/\/$/, "")}/api/n8n/deploy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workflow }),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error(`The FlowArchitect backend at ${proxyUrl} didn't return a valid response. Is it running?`);
  }

  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : data?.error?.message || `Deploy failed (${res.status}).`;
    throw new Error(message);
  }

  return data;
}
