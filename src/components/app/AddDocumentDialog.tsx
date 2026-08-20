import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (title: string, content: string) => void;
};

export function AddDocumentDialog({ open, onOpenChange, onAdd }: Props) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const submit = () => {
    if (!content.trim()) return;
    onAdd(title.trim() || "Untitled document", content.trim());
    setTitle("");
    setContent("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add a document</DialogTitle>
          <DialogDescription>
            Paste meeting notes, a spec, a transcript, or any text you need answers from.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Q3 planning notes"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doc-content">Content</Label>
            <Textarea
              id="doc-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the document text…"
              className="min-h-[220px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!content.trim()}>
            Add to workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}