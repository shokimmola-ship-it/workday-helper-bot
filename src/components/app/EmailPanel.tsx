import { Copy, Loader2, Mail } from "lucide-react";
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
  purpose: string;
  recipient: string;
  tone: string;
  length: string;
  email: string;
  busy: boolean;
  onChange: (patch: Partial<{ purpose: string; recipient: string; tone: string; length: string }>) => void;
  onGenerate: () => void;
  onCopy: () => void;
};

const TONES = ["Formal", "Friendly", "Persuasive", "Direct", "Apologetic", "Appreciative"];
const LENGTHS = ["Short (under 100 words)", "Standard", "Detailed"];

export function EmailPanel({
  purpose,
  recipient,
  tone,
  length,
  email,
  busy,
  onChange,
  onGenerate,
  onCopy,
}: Props) {
  return (
    <div className="grid h-full gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="purpose">What is the email about?</Label>
          <Textarea
            id="purpose"
            value={purpose}
            onChange={(e) => onChange({ purpose: e.target.value })}
            placeholder="Follow up on the pricing meeting and ask for the signed SOW by Friday…"
            className="min-h-[110px] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="recipient">Recipient</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => onChange({ recipient: e.target.value })}
            placeholder="e.g. Tom, client procurement lead"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={(v) => onChange({ tone: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Length</Label>
            <Select value={length} onValueChange={(v) => onChange({ length: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LENGTHS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="w-full" disabled={busy || !purpose.trim()} onClick={onGenerate}>
          {busy ? <Loader2 className="animate-spin" /> : <Mail />}
          {busy ? "Writing…" : "Generate email"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Selected sources are used as context when available.
        </p>
      </div>

      <div className="panel min-h-[320px] overflow-y-auto p-6">
        {email ? (
          <>
            <div className="mb-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Copy /> Copy email
              </Button>
            </div>
            <Markdown>{email}</Markdown>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {busy
              ? "Drafting your email…"
              : "Your drafted email with a subject line will appear here."}
          </p>
        )}
      </div>
    </div>
  );
}
