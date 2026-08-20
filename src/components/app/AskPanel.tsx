import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "./Markdown";
import type { ChatTurn } from "./types";

type Props = {
  turns: ChatTurn[];
  busy: boolean;
  disabled: boolean;
  onAsk: (q: string) => void;
};

const SUGGESTIONS = [
  "What decisions were made and by whom?",
  "List every open risk with its impact.",
  "What are my action items this week?",
  "Summarise this for an executive in 5 lines.",
];

export function AskPanel({ turns, busy, disabled, onAsk }: Props) {
  const [value, setValue] = useState("");

  const submit = (q: string) => {
    if (!q.trim() || busy || disabled) return;
    onAsk(q.trim());
    setValue("");
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {turns.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ask anything about the selected documents. Answers are grounded in their text only.
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => submit(s)}
                  disabled={disabled || busy}
                  className="rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-secondary-foreground transition-colors hover:border-primary/50 hover:bg-muted disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) =>
          turn.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
                {turn.content}
              </p>
            </div>
          ) : (
            <Markdown key={i}>{turn.content}</Markdown>
          ),
        )}

        {busy && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Reading the documents…
          </p>
        )}
      </div>

      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit(value);
            }
          }}
          placeholder={disabled ? "Select a document first" : "Ask about your documents…"}
          disabled={disabled}
          className="min-h-[88px] resize-none rounded-xl bg-card pr-14"
        />
        <Button
          size="icon"
          aria-label="Send question"
          className="absolute bottom-3 right-3 size-9 rounded-lg"
          disabled={disabled || busy || !value.trim()}
          onClick={() => submit(value)}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
      </div>
    </div>
  );
}