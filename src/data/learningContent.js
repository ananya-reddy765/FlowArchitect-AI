// Content shown in "Learn" mode — beginner-friendly explanations of the
// core concepts behind workflow automation, independent of any one node.
export const learningTopics = [
  {
    title: "What is a workflow?",
    body: "A workflow is a sequence of automated steps that runs when something happens. Instead of doing a task by hand every time, you describe it once and let the automation repeat it.",
  },
  {
    title: "What is a trigger?",
    body: "A trigger is the event that starts a workflow — like a new email arriving, a scheduled time being reached, or a form being submitted.",
  },
  {
    title: "What is an action?",
    body: "An action is a step the workflow performs after it starts, such as saving a file, sending a message, or updating a spreadsheet.",
  },
  {
    title: "What is a condition?",
    body: "A condition checks a piece of data and decides what happens next. It lets a workflow behave differently depending on the situation, instead of always doing the same thing.",
  },
  {
    title: "What is an API?",
    body: "An API (Application Programming Interface) lets two systems talk to each other. A workflow can call an API to fetch data from, or send data to, an outside service.",
  },
  {
    title: "What is JSON?",
    body: "JSON is a simple text format for structuring data using keys and values. Workflows pass JSON between steps so each one knows exactly what data it received.",
  },
  {
    title: "How data moves between nodes",
    body: "Each node receives the output of the node before it, does something with that data, and passes its own output forward — like a relay race, one baton (the data) at a time.",
  },
  {
    title: "How automation works",
    body: "Automation replaces a manual, repetitive task with a workflow that runs on its own once triggered — saving time and reducing the chance of human error.",
  },
];

// Builds a one-paragraph, beginner-friendly explanation of a specific
// generated workflow, based on its nodes.
export function explainWorkflow(nodes) {
  if (!nodes || nodes.length === 0) {
    return "Add some nodes to your canvas to see an explanation of how this workflow works.";
  }

  const [trigger, ...rest] = nodes;
  const triggerText = `This workflow starts when ${trigger.data.label} fires (${trigger.data.action}).`;

  const stepsText = rest
    .map((node) => `then ${node.data.label} runs (${node.data.action})`)
    .join(", ");

  return `${triggerText}${stepsText ? " After that, " + stepsText + "." : ""}`;
}
