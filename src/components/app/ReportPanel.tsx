import { Copy, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Markdown } from "./Markdown";

type Props = {
  reportType: string;
  audience: string;
  notes: string;
  report: string;
  busy: boolean;
  disabled: boolean;
  onChange: (patch: { reportType?: string; audience?: string; notes?: string }) => void;
  onGenerate: () => void;
  onCopy: () => void;
};

const TYPES = [
  "Weekly status report",
  "Executive brief",
  "Project kickoff summary",
  "Incident post-mortem",
  "Client update email",
  "Meeting recap with actions",
];

export function ReportPanel({
  reportType,
  audience,
  notes,
  report,
  busy,
  disabled,
  onChange,
  onGenerate,
  onCopy,
}: Props) {
  return (
    <div className="grid h-full gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Report type</Label>
          <Select value={reportType} onValueChange={(v) => onChange({ reportType: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="audience">Audience</Label>
          <Input
            id="audience"
            value={audience}
            onChange={(e) => onChange({ audience: e.target.value })}
            placeholder="e.g. Leadership team"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Extra instructions</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Tone, length, things to emphasise…"
            className="min-h-[120px] resize-none"
          />
        </div>

        <Button className="w-full" disabled={disabled || busy} onClick={onGenerate}>
          {busy ? <Loader2 className="animate-spin" /> : <Wand2 />}
          {busy ? "Writing…" : "Generate report"}
        </Button>
      </div>

      <div className="panel min-h-[320px] overflow-y-auto p-6">
        {report ? (
          <>
            <div className="mb-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Copy /> Copy markdown
              </Button>
            </div>
            <Markdown>{report}</Markdown>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {busy
              ? "Drafting your report from the selected documents…"
              : "Your drafted report will appear here, ready to copy into email or a doc."}
          </p>
        )}
      </div>
    </div>
  );
}