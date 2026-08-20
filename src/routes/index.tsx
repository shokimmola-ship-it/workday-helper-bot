import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, FileStack, Loader2, PanelLeft, RefreshCw, ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AddDocumentDialog } from "@/components/app/AddDocumentDialog";
import { AskPanel } from "@/components/app/AskPanel";
import { DocumentSidebar } from "@/components/app/DocumentSidebar";
import { Markdown } from "@/components/app/Markdown";
import { ReportPanel } from "@/components/app/ReportPanel";
import type { ChatTurn, WorkDoc } from "@/components/app/types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { askDocuments, extractInsights, generateReport } from "@/lib/documents.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meetings Ahead — AI meeting briefings & reports" },
      {
        name: "description",
        content:
          "Turn meeting notes and transcripts into grounded answers, briefings and ready-to-send workplace reports with AI.",
      },
      { property: "og:title", content: "Meetings Ahead — AI meeting briefings & reports" },
      {
        property: "og:description",
        content:
          "Ask questions across your meeting notes and auto-draft status reports, recaps and executive briefs.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STORAGE_KEY = "meetings-ahead.docs.v1";

function Index() {
  const [docs, setDocs] = useState<WorkDoc[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [view, setView] = useState("brief");
  const [navOpen, setNavOpen] = useState(false);
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [insights, setInsights] = useState("");
  const [report, setReport] = useState("");
  const [form, setForm] = useState({
    reportType: "Weekly status report",
    audience: "Leadership team",
    notes: "",
  });
  const [busy, setBusy] = useState<"ask" | "brief" | "report" | null>(null);

  const ask = useServerFn(askDocuments);
  const brief = useServerFn(extractInsights);
  const write = useServerFn(generateReport);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: WorkDoc[] = JSON.parse(raw);
        setDocs(parsed);
        setSelected(parsed.map((d) => d.id));
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
  }, [docs]);

  const activeDocs = useMemo(
    () => docs.filter((d) => selected.includes(d.id)).map((d) => ({ title: d.title, content: d.content })),
    [docs, selected],
  );
  const noContext = activeDocs.length === 0;

  const addDoc = (title: string, content: string) => {
    const doc: WorkDoc = { id: crypto.randomUUID(), title, content, createdAt: Date.now() };
    setDocs((d) => [doc, ...d]);
    setSelected((s) => [...s, doc.id]);
  };

  const handleUpload = async (files: FileList) => {
    for (const file of Array.from(files)) {
      const text = await file.text();
      if (text.trim()) addDoc(file.name, text);
    }
    toast.success("Documents added to your workspace");
  };

  const fail = (e: unknown) =>
    toast.error(e instanceof Error ? e.message : "Something went wrong with the AI request");

  const handleAsk = async (question: string) => {
    const history = turns.slice(-8);
    setTurns((t) => [...t, { role: "user", content: question }]);
    setBusy("ask");
    try {
      const { answer } = await ask({ data: { documents: activeDocs, question, history } });
      setTurns((t) => [...t, { role: "assistant", content: answer }]);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const handleBrief = async () => {
    setBusy("brief");
    try {
      const res = await brief({ data: { documents: activeDocs } });
      setInsights(res.insights);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const handleReport = async () => {
    setBusy("report");
    try {
      const res = await write({ data: { documents: activeDocs, ...form } });
      setReport(res.report);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(null);
    }
  };

  const sidebar = (
    <DocumentSidebar
      docs={docs}
      selected={selected}
      view={view}
      onViewChange={(v) => {
        setView(v);
        setNavOpen(false);
      }}
      onNew={() => setDialogOpen(true)}
      onUpload={handleUpload}
      onToggle={(id) =>
        setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
      }
      onRemove={(id) => {
        setDocs((d) => d.filter((x) => x.id !== id));
        setSelected((s) => s.filter((x) => x !== id));
      }}
    />
  );

  return (
    <main className="min-h-screen p-3 sm:p-4 lg:p-6">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 lg:h-[calc(100vh-3rem)] lg:flex-row lg:gap-5">
        <header className="flex items-center justify-between gap-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CalendarClock className="size-4" />
            </span>
            <span className="font-display text-base font-semibold">Meetings Ahead</span>
          </div>
          <Sheet open={navOpen} onOpenChange={setNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <PanelLeft /> Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-sm border-none bg-transparent p-2">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              {sidebar}
            </SheetContent>
          </Sheet>
        </header>

        <div className="hidden lg:flex">{sidebar}</div>

        <section className="panel flex min-h-0 flex-1 flex-col p-4 sm:p-6">
          <header className="flex flex-wrap items-end justify-between gap-3 pb-5">
            <div>
              <h2 className="font-display text-xl font-semibold sm:text-2xl">Meeting workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {noContext
                  ? "Add or select at least one meeting source to start."
                  : `${activeDocs.length} source${activeDocs.length > 1 ? "s" : ""} in context`}
              </p>
            </div>
            <span className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground">
              <FileStack className="size-3.5" /> Grounded answers only
            </span>
          </header>

          <Tabs value={view} onValueChange={setView} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="brief">Briefing</TabsTrigger>
              <TabsTrigger value="ask">Ask</TabsTrigger>
              <TabsTrigger value="report">Report</TabsTrigger>
            </TabsList>

            <TabsContent value="brief" className="mt-5 min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-wrap items-center gap-3 pb-4">
                <Button onClick={handleBrief} disabled={noContext || busy !== null}>
                  {busy === "brief" ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                  {insights ? "Regenerate briefing" : "Build briefing"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  Summary, decisions, risks and an action-item table.
                </p>
              </div>
              {insights ? (
                <Markdown>{insights}</Markdown>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {busy === "brief"
                    ? "Analysing your documents…"
                    : "No briefing yet — build one from the selected documents."}
                </p>
              )}
            </TabsContent>

            <TabsContent value="ask" className="mt-5 min-h-0 flex-1">
              <AskPanel
                turns={turns}
                busy={busy === "ask"}
                disabled={noContext || (busy !== null && busy !== "ask")}
                onAsk={handleAsk}
              />
            </TabsContent>

            <TabsContent value="report" className="mt-5 min-h-0 flex-1 overflow-y-auto">
              <ReportPanel
                {...form}
                report={report}
                busy={busy === "report"}
                disabled={noContext || busy !== null}
                onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
                onGenerate={handleReport}
                onCopy={() => {
                  navigator.clipboard.writeText(report);
                  toast.success("Report copied to clipboard");
                }}
              />
            </TabsContent>
          </Tabs>

          <p className="mt-4 flex items-start gap-2 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
            <span>
              Responsible AI: responses are generated by AI from the sources you select and can be
              incomplete or wrong. Review and verify before sharing decisions, commitments or
              anything sent externally. Avoid uploading personal or confidential data you are not
              permitted to process.
            </span>
          </p>
        </section>
      </div>

      <AddDocumentDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addDoc} />
    </main>
  );
}
