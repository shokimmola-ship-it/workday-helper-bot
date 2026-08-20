import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, WORKDESK_MODEL } from "./ai-gateway.server";

const DocInput = z.object({
  title: z.string(),
  content: z.string().min(1),
});

const AskInput = z.object({
  documents: z.array(DocInput).min(1),
  question: z.string().min(1),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
});

const ReportInput = z.object({
  documents: z.array(DocInput).min(1),
  reportType: z.string(),
  audience: z.string(),
  notes: z.string().default(""),
});

const EmailInput = z.object({
  documents: z.array(DocInput).default([]),
  purpose: z.string().min(1),
  recipient: z.string().default(""),
  tone: z.string(),
  length: z.string(),
});

const PlanInput = z.object({
  documents: z.array(DocInput).default([]),
  horizon: z.string(),
  hoursPerDay: z.string(),
  extraTasks: z.string().default(""),
  priorities: z.string().default(""),
});

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured (missing LOVABLE_API_KEY).");
  return createLovableAiGatewayProvider(key);
}

function corpus(docs: { title: string; content: string }[]) {
  return docs
    .map((d, i) => `### Document ${i + 1}: ${d.title}\n${d.content.slice(0, 60000)}`)
    .join("\n\n");
}

export const askDocuments = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AskInput.parse(input))
  .handler(async ({ data }) => {
    const result = streamText({
      model: gateway()(WORKDESK_MODEL),
      system:
        "You are Meetings Ahead, a meeting analyst assistant. Answer strictly from the provided documents. " +
        "Cite the document title in bold when you use it. If the answer is not in the documents, say so plainly and suggest what info is missing. " +
        "Use tight markdown: short paragraphs and bullets.",
      messages: [
        { role: "user", content: `Source documents:\n\n${corpus(data.documents)}` },
        ...data.history,
        { role: "user", content: data.question },
      ],
    });
    return { answer: await result.text };
  });

export const generateReport = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ReportInput.parse(input))
  .handler(async ({ data }) => {
    const result = streamText({
      model: gateway()(WORKDESK_MODEL),
      system:
        "You are Meetings Ahead, a workplace report writer. Produce a polished, ready-to-send markdown report " +
        "grounded only in the supplied documents. Never invent metrics. Include a title, a 3-bullet executive summary, " +
        "body sections, risks/blockers, and a table of next actions with owners where known.",
      prompt:
        `Report type: ${data.reportType}\nAudience: ${data.audience}\n` +
        `Extra instructions: ${data.notes || "none"}\n\nSource documents:\n\n${corpus(data.documents)}`,
    });
    return { report: await result.text };
  });

export const extractInsights = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ documents: z.array(DocInput).min(1) }).parse(input))
  .handler(async ({ data }) => {
    const result = streamText({
      model: gateway()(WORKDESK_MODEL),
      system:
        "Extract a workplace briefing from the documents. Return markdown with exactly these sections: " +
        "'## Summary' (max 4 bullets), '## Key decisions', '## Risks', '## Action items' (markdown table: Action | Owner | Due). " +
        "Use 'Unassigned'/'TBD' when unknown.",
      prompt: corpus(data.documents),
    });
    return { insights: await result.text };
  });

export const draftEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const result = streamText({
      model: gateway()(WORKDESK_MODEL),
      system:
        "You are Meetings Ahead, a professional email writer. Write one ready-to-send workplace email. " +
        "Return markdown with '**Subject:** ...' on the first line, then the email body with a greeting, " +
        "tight paragraphs, any needed bullet list, a clear ask, and a sign-off placeholder [Your name]. " +
        "Match the requested tone precisely. Never invent facts, dates or numbers that are not supplied.",
      prompt:
        `Purpose: ${data.purpose}\nRecipient: ${data.recipient || "unspecified colleague"}\n` +
        `Tone: ${data.tone}\nLength: ${data.length}\n\n` +
        (data.documents.length
          ? `Ground the email in these sources:\n\n${corpus(data.documents)}`
          : "No source documents supplied — rely only on the purpose above."),
    });
    return { email: await result.text };
  });

export const planSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PlanInput.parse(input))
  .handler(async ({ data }) => {
    const result = streamText({
      model: gateway()(WORKDESK_MODEL),
      system:
        "You are Meetings Ahead, a task planner. Build a realistic work schedule. Return markdown with: " +
        "'## Priorities' (ranked list using an impact/urgency rationale in one line each), " +
        "'## Schedule' (a markdown table: Time block | Task | Why now), grouped by day when the horizon is a week, " +
        "and '## Watch-outs' (overload, dependencies, missing info). Respect the available hours per day, " +
        "leave buffer time, and never schedule more work than the hours allow.",
      prompt:
        `Horizon: ${data.horizon}\nAvailable focus hours per day: ${data.hoursPerDay}\n` +
        `Stated priorities: ${data.priorities || "infer from the tasks"}\n` +
        `Additional tasks from the user:\n${data.extraTasks || "none"}\n\n` +
        (data.documents.length
          ? `Pull commitments, action items and deadlines from these sources:\n\n${corpus(data.documents)}`
          : "No source documents supplied — plan only from the tasks above."),
    });
    return { plan: await result.text };
  });
