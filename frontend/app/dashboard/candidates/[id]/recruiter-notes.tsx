"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function RecruiterNotes({ candidateId }: { candidateId: string }) {
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!note.trim()) return;
    setIsSaving(true);
    await supabase.from("recruiter_notes").insert({
      candidate_id: candidateId,
      note_content: note.trim(),
    });
    setIsSaving(false);
    setSaved(true);
    setNote("");
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="surface-card p-5">
      <h3 className="text-base font-bold tracking-tight text-foreground mb-3">
        Recruiter Notes
      </h3>
      <textarea
        className="w-full min-h-[110px] p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary placeholder:text-muted-foreground resize-none transition-colors"
        placeholder="Add your observations about this candidate..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="flex justify-end mt-3 items-center gap-3">
        {saved && (
          <span className="text-xs text-success font-medium">Note saved ✓</span>
        )}
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving || !note.trim()}
          variant="secondary"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-1.5" />
          )}
          Save Note
        </Button>
      </div>
    </div>
  );
}
