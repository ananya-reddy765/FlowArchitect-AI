import { registerN8nNodes } from "../data/n8nNodeRegistry";

let syncPromise = null;

export function syncN8nNodeLibrary(proxyUrl = "http://localhost:4000") {
  if (syncPromise) return syncPromise;

  syncPromise = fetch(`${proxyUrl.replace(/\/$/, "")}/api/n8n/nodes`)
    .then(async (res) => {
      if (!res.ok) throw new Error(`n8n node catalog unavailable (${res.status})`);
      const data = await res.json();
      const result = registerN8nNodes(data.nodes || []);
      return { ...result, total: data.total || 0, n8nUrl: data.n8nUrl };
    })
    .catch((error) => {
      // The existing built-in FlowArchitect library remains fully usable
      // when n8n is offline or the catalog endpoint is unavailable.
      return { added: 0, updated: 0, total: 0, error };
    });

  return syncPromise;
}
