// Local persistence for workflows.
// A custom event keeps the Dashboard in sync immediately in the same tab.

const STORAGE_KEY = "flowarchitect_workflows";
const WORKFLOW_EVENT = "flowarchitect:workflows-changed";

function notify() {
  window.dispatchEvent(new CustomEvent(WORKFLOW_EVENT));
}

export function getWorkflowStorageEventName() {
  return WORKFLOW_EVENT;
}

export function getWorkflows() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read workflows from localStorage:", error);
    return [];
  }
}

export function getWorkflowById(id) {
  return getWorkflows().find((workflow) => workflow.id === id) || null;
}

export function saveWorkflow(workflow) {
  const workflows = getWorkflows();
  const existingIndex = workflows.findIndex((item) => item.id === workflow.id);
  const updated = existingIndex >= 0
    ? workflows.map((item, index) => index === existingIndex ? workflow : item)
    : [workflow, ...workflows];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
}

export function updateWorkflow(id, updates) {
  const updated = getWorkflows().map((workflow) =>
    workflow.id === id ? { ...workflow, ...updates } : workflow
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
}

export function deleteWorkflow(id) {
  const updated = getWorkflows().filter((workflow) => workflow.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notify();
  return updated;
}
