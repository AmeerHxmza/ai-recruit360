"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsDown, ThumbsUp, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export function CandidateActions({
  candidateId,
  currentStatus,
}: {
  candidateId: string;
  currentStatus: string;
}) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const router = useRouter();

  const handleReject = async () => {
    setIsRejecting(true);
    await supabase
      .from("candidates")
      .update({ status: "Rejected" })
      .eq("id", candidateId);
    setIsRejecting(false);
    router.refresh();
  };

  const handleAdvance = async () => {
    setIsAdvancing(true);
    await supabase
      .from("candidates")
      .update({ status: "Verified Match" })
      .eq("id", candidateId);
    setIsAdvancing(false);
    router.refresh();
  };

  const isAlreadyActioned =
    currentStatus === "Rejected" || currentStatus === "Verified Match";

  return (
    <div className="flex gap-2.5 w-full sm:w-auto">
      <Button
        variant="outline"
        className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10 hover:border-destructive"
        onClick={handleReject}
        disabled={isRejecting || isAdvancing || currentStatus === "Rejected"}
      >
        {isRejecting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <ThumbsDown className="w-4 h-4 mr-2" />
        )}
        Reject
      </Button>
      <Button
        className="flex-1 sm:flex-none"
        onClick={handleAdvance}
        disabled={isAdvancing || isRejecting || currentStatus === "Verified Match"}
      >
        {isAdvancing ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <ThumbsUp className="w-4 h-4 mr-2" />
        )}
        Advance to Final
      </Button>
    </div>
  );
}
