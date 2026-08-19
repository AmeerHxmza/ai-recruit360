"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/candidates");
  }, [router]);

  return (
    <div className="p-12 text-center text-xs font-mono text-[#6B7280]">
      Redirecting to Master Candidates Leaderboard...
    </div>
  );
}
