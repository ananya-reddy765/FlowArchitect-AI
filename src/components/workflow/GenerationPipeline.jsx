import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  MessageCircleQuestion,
  Brain,
  GitBranch,
  Scale,
  Workflow,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Bot,
  Cog,
} from "lucide-react";

import { analyzeRequirements, generateClarifyingQuestions, buildEnrichedInput } from "../../utils/requirementAnalyzer";
import { generateWorkflow } from "../../utils/workflowGenerator";
import { classifyWorkflowDecisions } from "../../utils/decisionEngine";
import { convertToN8nWorkflow } from "../../utils/n8nExporter";
import { runValidationChecks } from "../../utils/validateWorkflow";

const STAGE_META = {
  clarify: { title: "Clarify Requirements", icon: MessageCircleQuestion },
  analyze: { title: "AI Requirement Analysis", icon: Brain },
  blueprint: { title: "Workflow Blueprint", icon: GitBranch },
  decision: { title: "AI vs Rule-Based Decision", icon: Scale },
  n8n: { title: "n8n Integration", icon: Workflow },
  validate: { title: "Validation", icon: ShieldCheck },
};

export default function GenerationPipeline({ input, onComplete, onCancel }) {
  const analysis = useMemo(() => analyzeRequirements(input), [input]);
  const questions = useMemo(() => generateClarifyingQuestions(analysis), [analysis]);

  const stages = useMemo(
    () => (questions.length > 0 ? ["clarify", "analyze", "blueprint", "decision", "n8n", "validate"] : ["analyze", "blueprint", "decision", "n8n", "validate"]),
    [questions.length]
  );

  const [stageIndex, setStageIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  // Snapshot of answers taken the moment the user leaves the clarify stage
  // (or immediately, if there was nothing to clarify). Generation is
  // derived from this snapshot via useMemo rather than an effect, so
  // there's no setState-in-effect render cascade.
  const [answersSnapshot, setAnswersSnapshot] = useState(() => (questions.length === 0 ? {} : null));
  const [validationComplete, setValidationComplete] = useState(false);

  const currentStage = stages[stageIndex];

  const generated = useMemo(() => {
    if (!answersSnapshot) return null;
    const enrichedInput = buildEnrichedInput(input, answersSnapshot);
    const result = generateWorkflow(enrichedInput, answersSnapshot);
    const decisions = classifyWorkflowDecisions(result.nodes);
    const n8nJson = convertToN8nWorkflow({ nodes: result.nodes, edges: result.edges }, result.name);
    const validationChecks = runValidationChecks({ nodes: result.nodes, edges: result.edges });
    return { ...result, decisions, n8nJson, validationChecks };
  }, [answersSnapshot, input]);

  function goNext() {
    if (currentStage === "clarify") {
      setAnswersSnapshot({ ...answers });
    }
    if (stageIndex < stages.length - 1) {
      setStageIndex((i) => i + 1);
    } else if (generated) {
      onComplete(generated);
    }
  }

  const isLastStage = stageIndex === stages.length - 1;
  const canAdvance =
    currentStage === "clarify" ? true : currentStage === "validate" ? validationComplete : !!generated;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header with stage dots */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">
              Stage {stageIndex + 1} of {stages.length}
            </p>
            <h3 className="text-xl font-bold mt-1">{STAGE_META[currentStage]?.title}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pt-4 flex gap-2 shrink-0">
          {stages.map((s, i) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < stageIndex ? "bg-violet-500" : i === stageIndex ? "bg-violet-300" : "bg-gray-100"
              }`}
            />
          ))}
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {currentStage === "clarify" && (
                <ClarifyStage questions={questions} answers={answers} setAnswers={setAnswers} />
              )}
              {currentStage === "analyze" && <AnalyzeStage generated={generated} />}
              {currentStage === "blueprint" && <BlueprintStage generated={generated} />}
              {currentStage === "decision" && <DecisionStage generated={generated} />}
              {currentStage === "n8n" && <N8nStage generated={generated} />}
              {currentStage === "validate" && (
                <ValidateStage generated={generated} onAllRevealed={() => setValidationComplete(true)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={goNext}
            disabled={!canAdvance}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2"
          >
            {isLastStage ? "Open in Builder" : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ClarifyStage({ questions, answers, setAnswers }) {
  return (
    <div className="space-y-5">
      <p className="text-gray-600 text-sm">
        Your description leaves a few things open. Answer what you can — anything you
        skip will just use a sensible default.
      </p>
      {questions.map((q) => (
        <div key={q.id}>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{q.question}</label>
          <input
            value={answers[q.field] || ""}
            onChange={(e) => setAnswers((a) => ({ ...a, [q.field]: e.target.value }))}
            placeholder={q.placeholder}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400"
          />
        </div>
      ))}
    </div>
  );
}

function AnalyzeStage({ generated }) {
  if (!generated) return <LoadingRow text="Reading triggers, actions, and conditions..." />;
  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Natural language processing identified the following structure in your request:
      </p>
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-5 space-y-2">
        {generated.analysis.detected.map((line, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-medium text-violet-800">
            <CheckCircle2 size={15} className="text-violet-500 shrink-0" />
            {line}
          </div>
        ))}
      </div>
      {generated.analysis.usedFallback && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          No specific integration was named, so a general AI processing + email step was used.
          You can swap either node out on the canvas.
        </p>
      )}
    </div>
  );
}

function BlueprintStage({ generated }) {
  if (!generated) return <LoadingRow text="Structuring the automation flow..." />;
  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        The detected steps are arranged into a logical blueprint — this is the shape the
        canvas will load with.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {generated.nodes.map((node, i) => (
          <div key={node.id} className="flex items-center gap-2">
            <span className="bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
              {node.data.label}
            </span>
            {i < generated.nodes.length - 1 && <ArrowRight size={14} className="text-gray-300" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionStage({ generated }) {
  if (!generated) return <LoadingRow text="Deciding where AI reasoning is needed..." />;
  return (
    <div className="space-y-3">
      <p className="text-gray-600 text-sm">
        Each step is routed to AI or a plain rule based on whether its output is
        open-ended or fully predictable.
      </p>
      {generated.decisions.map((d) => (
        <div
          key={d.id}
          className="flex items-start gap-3 border border-gray-200 rounded-2xl p-4"
        >
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              d.decision === "ai" ? "bg-violet-100 text-violet-600" : "bg-gray-100 text-gray-500"
            }`}
          >
            {d.decision === "ai" ? <Bot size={16} /> : <Cog size={16} />}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-800">
              {d.label}
              <span
                className={`ml-2 text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  d.decision === "ai" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {d.decision === "ai" ? "AI" : "Rule-Based"}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{d.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function N8nStage({ generated }) {
  if (!generated) return <LoadingRow text="Mapping steps onto n8n nodes..." />;
  return (
    <div className="space-y-4">
      <p className="text-gray-600 text-sm">
        Every step is mapped to a real n8n node type, and the connections between them
        are rebuilt so the graph runs as-is inside n8n.
      </p>
      <div className="space-y-2">
        {generated.n8nJson.nodes.map((n) => (
          <div
            key={n.id}
            className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          >
            <span className="font-medium text-gray-700">{n.name}</span>
            <code className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded-md">
              {n.type.replace("n8n-nodes-base.", "")}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
}

// Owns its own reveal timer. It mounts exactly once (validate is the final
// stage), so the initial state of 0 already serves as the "reset" — no
// synchronous setState inside the effect is needed, only the deferred
// calls inside setTimeout.
function ValidateStage({ generated, onAllRevealed }) {
  const [revealedChecks, setRevealedChecks] = useState(0);
  const checks = generated?.validationChecks || [];

  useEffect(() => {
    if (!generated) return;
    const timers = checks.map((_, i) =>
      setTimeout(() => {
        setRevealedChecks(i + 1);
        if (i + 1 === checks.length) onAllRevealed();
      }, (i + 1) * 350)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generated]);

  if (!generated) return <LoadingRow text="Preparing validation..." />;

  const allDone = revealedChecks >= checks.length;
  const failed = checks.filter((c) => !c.passed);

  return (
    <div className="space-y-3">
      <p className="text-gray-600 text-sm">
        Checking the generated workflow for missing nodes, broken connections, and
        incomplete branches before it's marked ready.
      </p>
      {checks.slice(0, revealedChecks).map((c) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 border border-gray-200 rounded-xl px-4 py-3"
        >
          {c.passed ? (
            <CheckCircle2 size={17} className="text-green-500 shrink-0 mt-0.5" />
          ) : (
            <XCircle size={17} className="text-red-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-800">{c.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.detail}</p>
          </div>
        </motion.div>
      ))}
      {allDone && (
        <div
          className={`mt-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            failed.length === 0
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          {failed.length === 0
            ? "Workflow passed validation and is ready to open in the builder."
            : `${failed.length} check(s) need attention — you can still open it and fix them on the canvas.`}
        </div>
      )}
    </div>
  );
}

function LoadingRow({ text }) {
  return (
    <div className="flex items-center gap-3 text-gray-500 text-sm py-6">
      <span className="w-2 h-2 rounded-full bg-violet-500 animate-ping" />
      {text}
    </div>
  );
}
