import { CalendarRange, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  horizon: string;
  hoursPerDay: string;
  priorities: string;
  extraTasks: string;
  plan: string;
  busy: boolean;
  onChange: (
    patch: Partial<{ horizon: string; hoursPerDay: string; priorities: string; extraTasks: string }>,
  ) => void;
  onGenerate: () => void;
  onCopy: () => void;
};

const HORIZONS = ["Today", "Tomorrow", "This week", "Next week"];
const HOURS = ["3", "4", "5", "6", "7", "8"];

export function PlannerPanel({
  horizon,
  hoursPerDay,
  priorities,
  extraTasks,
  plan,
  busy,
  onChange,
  onGenerate,
  onCopy,
}: Props) {
  return (
    <div className="grid h-full gap-5 lg:grid-cols-[300px_1fr]">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Plan for</Label>
            <Select value={horizon} onValueChange={(v) => onChange({ horizon: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HORIZONS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Focus hours / day</Label>
            <Select value={hoursPerDay} onValueChange={(v) => onChange({ hoursPerDay: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h} hours
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tasks">Tasks to include</Label>
          <Textarea
            id="tasks"
            value={extraTasks}
            onChange={(e) => onChange({ extraTasks: e.target.value })}
            placeholder="One per line — plus anything not captured in your meeting notes."
            className="min-h-[130px] resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="priorities">What matters most?</Label>
          <Textarea
            id="priorities"
            value={priorities}
            onChange={(e) => onChange({ priorities: e.target.value })}
            placeholder="Client deadline Friday, hiring loop, protect deep-work mornings…"
            className="min-h-[80px] resize-none"
          />
        </div>

        <Button
          className="w-full"
          disabled={busy || !extraTasks.trim()}
          onClick={onGenerate}
        >
          {busy ? <Loader2 className="animate-spin" /> : <CalendarRange />}
          {busy ? "Planning…" : "Build schedule"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Action items from your selected sources are pulled in automatically.
        </p>
      </div>

      <div className="panel min-h-[320px] overflow-y-auto p-6">
        {plan ? (
          <>
            <div className="mb-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Copy /> Copy plan
              </Button>
            </div>
            <Markdown>{plan}</Markdown>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            {busy
              ? "Prioritising tasks and blocking time…"
              : "Your prioritised task list and time-blocked schedule will appear here."}
          </p>
        )}
      </div>
    </div>
  );
}
