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
