"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

export function RecruiterNotes({ candidateId }: { candidateId: string }) {
  const [note, setNote] = useState("");
  const [existingNotes, setExistingNotes] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchNotes() {
      const { data } = await supabase
        .from("recruiter_notes")
        .select("id, note_content, created_at")
        .eq("candidate_id", candidateId)
        .order("created_at", { ascending: false });
      
      if (data) {
        setExistingNotes(data);
      }
    }
    fetchNotes();
  }, [candidateId]);

  const handleSave = async () => {
    if (!note.trim()) return;
    setIsSaving(true);
    const newNote = {
      candidate_id: candidateId,
      note_content: note.trim(),
    };
    const { data } = await supabase.from("recruiter_notes").insert(newNote).select().single();
    
    setIsSaving(false);
    setSaved(true);
    setNote("");
    if (data) {
      setExistingNotes([data, ...existingNotes]);
    }
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

      {existingNotes.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-foreground border-b pb-2">Previous Notes</h4>
          {existingNotes.map((n) => (
            <div key={n.id} className="p-3 bg-muted/20 rounded-md text-sm border border-border">
              <p className="text-foreground whitespace-pre-wrap">{n.note_content}</p>
              <div className="text-xs text-muted-foreground mt-2">
                {new Date(n.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
