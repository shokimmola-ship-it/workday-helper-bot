import { CalendarClock, FileText, MessageSquareText, Plus, ScrollText, Sparkles, Trash2, Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { WorkDoc } from "./types";

type Props = {
  docs: WorkDoc[];
  selected: string[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onNew: () => void;
  onUpload: (files: FileList) => void;
  view: string;
  onViewChange: (view: string) => void;
};

const NAV = [
  { value: "brief", label: "Briefing", icon: Sparkles },
  { value: "ask", label: "Ask meetings", icon: MessageSquareText },
  { value: "report", label: "Reports", icon: ScrollText },
];

export function DocumentSidebar({
  docs,
  selected,
  onToggle,
  onRemove,
  onNew,
  onUpload,
  view,
  onViewChange,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="ink-panel flex h-full w-full flex-col rounded-2xl p-5 lg:w-80">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <CalendarClock className="size-5" />
        </div>
        <div>
          <h1 className="font-display text-base font-semibold">Meetings Ahead</h1>
          <p className="text-xs opacity-70">AI meeting intelligence</p>
        </div>
      </div>

      <nav className="mt-6 space-y-1" aria-label="Sections">
        {NAV.map((item) => {
          const active = view === item.value;
          return (
            <button
              key={item.value}
              onClick={() => onViewChange(item.value)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-accent text-accent-foreground" : "opacity-75 hover:bg-white/10 hover:opacity-100",
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">Sources</p>

      <div className="mt-2 flex gap-2">
        <Button variant="secondary" size="sm" className="flex-1" onClick={onNew}>
          <Plus /> Paste
        </Button>
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => fileRef.current?.click()}>
          <Upload /> Upload
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.csv,.json,.log"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      <ScrollArea className="-mr-2 mt-3 max-h-64 flex-1 pr-2">
        <div className="space-y-1.5 py-1">
          {docs.length === 0 && (
            <p className="rounded-lg border border-dashed border-white/15 p-4 text-xs leading-relaxed opacity-70">
              No sources yet. Paste meeting notes, an agenda or a transcript to begin.
            </p>
          )}
          {docs.map((doc) => {
            const active = selected.includes(doc.id);
            return (
              <div
                key={doc.id}
                role="button"
                tabIndex={0}
                onClick={() => onToggle(doc.id)}
                onKeyDown={(e) => e.key === "Enter" && onToggle(doc.id)}
                className={cn(
                  "group flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-accent/70 bg-white/12"
                    : "border-transparent bg-white/5 hover:bg-white/10",
                )}
              >
                <FileText className={cn("mt-0.5 size-4 shrink-0", active ? "text-accent" : "opacity-60")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{doc.title}</span>
                  <span className="block text-[11px] opacity-60">
                    {doc.content.trim().split(/\s+/).length} words
                  </span>
                </span>
                <button
                  aria-label={`Remove ${doc.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(doc.id);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-70 hover:!opacity-100"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <p className="mt-4 border-t border-white/10 pt-3 text-[11px] leading-relaxed opacity-55">
        Selected sources are the only context the AI reads. Everything stays in this browser.
      </p>
    </aside>
  );
}