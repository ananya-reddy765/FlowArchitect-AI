import { buildChain } from "./flowBuilder";

// Pre-built workflow templates. Clicking one loads its nodes/edges
// straight into the canvas via buildChain (same helper the AI generator
// and manual chain-building use).
const templateDefs = [
  {
    name: "Invoice Automation",
    description: "Save Gmail invoice attachments to Google Drive and notify Slack.",
    chain: ["gmail-trigger", "google-drive", "slack"],
  },
  {
    name: "Lead Management",
    description: "Add new form submissions to Google Sheets and email a confirmation.",
    chain: ["form-submission", "google-sheets", "send-email"],
  },
  {
    name: "Customer Support",
    description: "Create a task and notify the support team for new requests.",
    chain: ["form-submission", "ai-agent", "slack"],
  },
  {
    name: "Daily Report",
    description: "Generate a daily report every morning and email it to the team.",
    chain: ["schedule", "ai-agent", "send-email"],
  },
  {
    name: "Social Media Automation",
    description: "Generate a post on a schedule and publish it via API.",
    chain: ["schedule", "ai-agent", "http-request"],
  },
  {
    name: "Employee Onboarding",
    description: "Log a new hire in Sheets and send them a welcome email.",
    chain: ["form-submission", "google-sheets", "send-email"],
  },
  {
    name: "Form → Email → Sheets",
    description: "On form submission, email the submitter and log the entry.",
    chain: ["form-submission", "send-email", "google-sheets"],
  },
  {
    name: "Webhook → AI → Slack",
    description: "On webhook call, process with AI and post the result to Slack.",
    chain: ["webhook", "ai-agent", "slack"],
  },
  {
    name: "API → Database → Email",
    description: "On API call, store the result in a database and email a summary.",
    chain: ["webhook", "postgresql", "send-email"],
  },
];

export function getWorkflowTemplates() {
  return templateDefs.map((template) => {
    const { nodes, edges } = buildChain(template.chain);
    return { name: template.name, description: template.description, nodes, edges };
  });
}
