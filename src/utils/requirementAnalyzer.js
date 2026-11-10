import { findTrigger, findActions } from "./workflowGenerator";

const CONDITION_LANGUAGE = [
  "below",
  "above",
  "greater than",
  "less than",
  "at least",
  "at most",
  "exceeds",
  "under",
  "over",
  ">",
  "<",
];

const NOTIFICATION_NODE_TYPES = new Set([
  "send-email",
  "gmail",
  "email",
  "slack",
  "slack-notification",
  "discord",
  "teams",
]);

const EMAIL_NODE_TYPES = new Set(["send-email", "gmail", "email"]);
const CHANNEL_NODE_TYPES = new Set(["slack", "slack-notification", "discord", "teams"]);

// Stage 1 (User Requirements) analysis: figures out what's clear vs.
// ambiguous in the user's plain-English description, before anything is
// generated. This mirrors what stage 2 (AI Requirement Analysis) will do,
// but its only job here is to spot gaps worth asking about.
export function analyzeRequirements(input) {
  const text = ` ${input.toLowerCase()} `;

  const trigger = findTrigger(text);
  const triggerWasExplicit = trigger !== "manual-trigger";

  let actions = findActions(text);
  const actionsWereFallback = actions.length === 0;
  if (actionsWereFallback) actions = ["ai-agent", "send-email"];

  const hasConditionLanguage = CONDITION_LANGUAGE.some((k) => text.includes(k));
  const conditionHasNumber = /\d/.test(text) && hasConditionLanguage;

  const needsRecipient = actions.some((a) => EMAIL_NODE_TYPES.has(a)) && !text.includes("@");
  const needsChannel =
    actions.some((a) => CHANNEL_NODE_TYPES.has(a)) &&
    !/#[a-z0-9_-]+/.test(text) &&
    !/channel\s+[a-z0-9_-]+/.test(text);

  return {
    trigger,
    triggerWasExplicit,
    actions,
    actionsWereFallback,
    hasConditionLanguage,
    conditionHasNumber,
    needsRecipient,
    needsChannel,
    hasNotificationStep: actions.some((a) => NOTIFICATION_NODE_TYPES.has(a)),
  };
}

// Builds the actual clarifying questions for stage 1 based on the gaps
// analyzeRequirements() found. Returns [] when the description is already
// specific enough — in that case the pipeline skips straight to stage 2.
export function generateClarifyingQuestions(analysis) {
  const questions = [];

  if (!analysis.triggerWasExplicit) {
    questions.push({
      id: "triggerDetail",
      field: "triggerDetail",
      question: "What should start this workflow?",
      placeholder: "e.g. a daily schedule, a new form submission, an incoming webhook",
    });
  }

  if (analysis.hasConditionLanguage && !analysis.conditionHasNumber) {
    questions.push({
      id: "threshold",
      field: "threshold",
      question: "What's the exact threshold or value for that condition?",
      placeholder: "e.g. 75%, ₹50,000, 3 days",
    });
  }

  if (analysis.needsRecipient) {
    questions.push({
      id: "recipient",
      field: "recipient",
      question: "Who should receive the email?",
      placeholder: "e.g. student, finance@company.com, the assigned manager",
    });
  }

  if (analysis.needsChannel) {
    questions.push({
      id: "channel",
      field: "channel",
      question: "Which channel should get the notification?",
      placeholder: "e.g. #sales, #alerts",
    });
  }

  if (analysis.actionsWereFallback) {
    questions.push({
      id: "nextStep",
      field: "nextStep",
      question: "What should happen with the result?",
      placeholder: "e.g. send an email, post to Slack, save to Google Sheets",
    });
  }

  return questions;
}

// Folds the answers back into a single enriched description so the real
// generator (stage 2) can re-detect nodes from it — e.g. answering
// "post to Slack" for nextStep will make a Slack node get picked up.
export function buildEnrichedInput(input, answers) {
  const extras = [];
  if (answers.triggerDetail) extras.push(`It should start when ${answers.triggerDetail}.`);
  if (answers.threshold) extras.push(`The threshold is ${answers.threshold}.`);
  if (answers.recipient) extras.push(`Send the email to ${answers.recipient}.`);
  if (answers.channel) extras.push(`Notify the channel ${answers.channel}.`);
  if (answers.nextStep) extras.push(`Then ${answers.nextStep}.`);

  if (extras.length === 0) return input;
  return `${input.trim()} ${extras.join(" ")}`;
}
