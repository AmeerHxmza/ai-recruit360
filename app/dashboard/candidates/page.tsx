"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { TruthfulnessScore } from "@/components/truthfulness-score";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  FileText,
  Github,
  Mic,
  BrainCircuit,
  Loader2
} from "lucide-react";

type Candidate = {
  id: number;
  name: string;
  role: string;
  status: string;
  score: number;
  applied: string;
  github: string;
  flagged: boolean;
};

const CANDIDATES: Candidate[] = [
  { id: 1, name: "Liam Johnson", role: "Frontend Dev", status: "Interviewed", score: 92, applied: "2h ago", github: "liamj", flagged: false },
  { id: 2, name: "Emma Wilson", role: "Frontend Dev", status: "Verified", score: 85, applied: "5h ago", github: "emmaw", flagged: false },
  { id: 3, name: "Noah Brown", role: "Backend Dev", status: "Applied", score: 45, applied: "1d ago", github: "noahb", flagged: true },
  { id: 4, name: "Olivia Davis", role: "Product Manager", status: "Interviewed", score: 78, applied: "1d ago", github: "divyad", flagged: false },
  { id: 5, name: "William Miller", role: "DevOps", status: "Interviewed", score: 24, applied: "2d ago", github: "williamm", flagged: true },
];
const CANDIDATE_ROLES = Array.from(new Set(CANDIDATES.map((c) => c.role)));

function CandidatesPageContent() {
  const searchParams = useSearchParams();
  const jobParam = searchParams.get("job");
  const [selectedJob, setSelectedJob] = useState<string>(
    jobParam && CANDIDATE_ROLES.includes(jobParam) ? jobParam : "all"
  );
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);

  const uniqueJobs = CANDIDATE_ROLES;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setIsLoading(false), 280);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const filteredAndSortedCandidates = useMemo(
    () =>
      CANDIDATES
        .filter((c) => (selectedJob === "all" ? true : c.role === selectedJob))
        .filter((c) => `${c.name} ${c.role} ${c.github}`.toLowerCase().includes(search.toLowerCase().trim()))
        .sort((a, b) => b.score - a.score),
    [search, selectedJob]
  );

  return (
    <div className="space-y-6 lg:space-y-8">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Candidates</h2>
          <p className="text-brand-slate">
            View and manage candidate applications.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="surface-card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-brand-slate" />
          <Input
            type="search"
            placeholder="Search candidates..."
            className="pl-8 w-full"
            value={search}
            onChange={(event) => {
              setIsLoading(true);
              setSearch(event.target.value);
            }}
          />
        </div>
        <Select
          value={selectedJob}
          onValueChange={(value) => {
            setIsLoading(true);
            setSelectedJob(value);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Jobs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobs</SelectItem>
            {uniqueJobs.map((job) => (
              <SelectItem key={job} value={job}>
                {job}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2 sm:w-auto">
          <Filter className="w-4 h-4" />
          Status
        </Button>
      </div>

      <div className="grid gap-4 sm:hidden">
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="surface-card space-y-3 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2.5 w-full" />
              </div>
            ))
          : filteredAndSortedCandidates.map((candidate) => (
          <CardCandidate key={candidate.id} candidate={candidate} onAction={(message, tone) => setToast({ message, tone })} />
        ))}
      </div>

      {/* Candidates Table */}
      <div className="hidden overflow-hidden rounded-md border bg-white md:block">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-10 w-full" />
            ))}
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Truthfulness Score</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCandidates.map((candidate) => (
              <CandidateRow key={candidate.id} candidate={candidate} onAction={(message, tone) => setToast({ message, tone })} />
            ))}
          </TableBody>
        </Table>
        )}
      </div>
      {!isLoading && filteredAndSortedCandidates.length === 0 ? (
        <div className="surface-card rounded-md p-8 text-center">
          <h3 className="text-lg font-semibold">No candidates match these filters</h3>
          <p className="mt-2 text-sm text-brand-slate">Try a different role or search keyword.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function CandidatesPage() {
  return (
    <Suspense fallback={<div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-72 w-full" /></div>}>
      <CandidatesPageContent />
    </Suspense>
  );
}

function CandidateRow({
  candidate,
  onAction,
}: {
  candidate: Candidate;
  onAction: (message: string, tone: "success" | "error" | "info") => void;
}) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  const handleReject = () => {
    setIsRejecting(true);
    setTimeout(() => {
      setIsRejecting(false);
      onAction(`${candidate.name} rejected.`, "error");
    }, 700);
  };

  const handleMove = () => {
    setIsMoving(true);
    setTimeout(() => {
      setIsMoving(false);
      onAction(`${candidate.name} moved to offer stage.`, "success");
    }, 700);
  };

  return (
    <TableRow className="group cursor-pointer transition-colors duration-200 hover:bg-brand-light/50">
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span>{candidate.name}</span>
          <span className="text-xs text-brand-slate flex items-center gap-1">
            <Github className="w-3 h-3" /> {candidate.github}
          </span>
        </div>
      </TableCell>
      <TableCell>{candidate.role}</TableCell>
      <TableCell>
        <Badge variant={candidate.flagged ? "destructive" : "secondary"} className={candidate.status === "Interviewed" ? "border-0 bg-brand-cyan/15 text-brand-cyan hover:bg-brand-cyan/20" : ""}>
          {candidate.flagged ? "Flagged" : candidate.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="w-[180px]">
          <TruthfulnessScore score={candidate.score} size="sm" showLabel={true} />
          {candidate.flagged && <span className="text-xs text-brand-archived font-medium mt-1 block">Suspicious Activity Detected</span>}
        </div>
      </TableCell>
      <TableCell className="text-brand-slate">{candidate.applied}</TableCell>
      <TableCell className="text-right">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">View Details</Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-brand-light flex items-center justify-center text-xl font-bold">
                  {candidate.name.charAt(0)}
                </div>
                <div>
                  <SheetTitle className="text-2xl">{candidate.name}</SheetTitle>
                  <SheetDescription>{candidate.role} • Applied {candidate.applied}</SheetDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">GitHub Verified</Badge>
                <Badge variant={candidate.flagged ? "destructive" : "default"}>
                  Score: {candidate.score}%
                </Badge>
              </div>
            </SheetHeader>

            <div className="space-y-6">
              {/* Resume Summary */}
              <div>
                <h3 className="text-sm font-medium text-brand-slate mb-3 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Resume Summary
                </h3>
                <div className="p-4 rounded-lg bg-brand-light text-sm space-y-2">
                  <p>Senior Frontend Developer with 5 years of experience in React and TypeScript.</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">React</Badge>
                    <Badge variant="secondary">TypeScript</Badge>
                    <Badge variant="secondary">Node.js</Badge>
                  </div>
                </div>
              </div>

              {/* Quiz/Reasoning Log */}
              <div>
                <h3 className="text-sm font-medium text-brand-slate mb-3 uppercase tracking-wide flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" /> AI Reasoning Log
                </h3>
                <div className="bg-brand-navy text-brand-light p-4 rounded-lg text-sm font-mono space-y-3">
                  <div className="border-l-2 border-brand-success pl-3">
                    <div className="text-brand-success text-xs mb-1">Pass • Code Verification</div>
                    <p>Candidate demonstrated strong understanding of React Hooks in the coding challenge. Solution was optimal O(n).</p>
                  </div>
                  <div className="border-l-2 border-brand-archived pl-3">
                    <div className="text-brand-archived text-xs mb-1">Warning • Voice Stress Analysis</div>
                    <p>Slight hesitation detected when asked about &quot;Database Sharding experience&quot;. Recommendation: Probe further in technical round.</p>
                  </div>
                  {candidate.flagged && (
                    <div className="border-l-2 border-brand-archived pl-3">
                      <div className="text-brand-archived text-xs mb-1">Fail • Browser Behavior</div>
                      <p>Tab switching detected 4 times during the quiz. High probability of external assistance.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Recording */}
              <div>
                <h3 className="text-sm font-medium text-brand-slate mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Mic className="w-4 h-4" /> Voice Interview
                </h3>
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-archived/10 flex items-center justify-center text-brand-archived">
                      <div className="w-2 h-2 bg-brand-archived rounded-full animate-pulse" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Tech Screen Recording</div>
                      <div className="text-xs text-brand-slate">14:20 mins</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Play</Button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t flex justify-end gap-3">
              <Button variant="destructive" onClick={handleReject} disabled={isRejecting || isMoving}>
                {isRejecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Reject
              </Button>
              <Button variant="accent" onClick={handleMove} disabled={isRejecting || isMoving}>
                {isMoving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Move to Offer
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </TableCell>
    </TableRow>
  )
}

function CardCandidate({
  candidate,
  onAction,
}: {
  candidate: Candidate;
  onAction: (message: string, tone: "success" | "error" | "info") => void;
}) {
  return (
    <div className="surface-card  space-y-4 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{candidate.name}</p>
          <p className="text-sm text-brand-slate">{candidate.role}</p>
          <p className="mt-1 flex items-center gap-1 text-xs text-brand-slate">
            <Github className="h-3 w-3" /> {candidate.github}
          </p>
        </div>
        <Badge variant={candidate.flagged ? "destructive" : "secondary"}>
          {candidate.flagged ? "Flagged" : candidate.status}
        </Badge>
      </div>
      <TruthfulnessScore score={candidate.score} size="sm" showLabel />
      <div className="flex items-center justify-between text-xs text-brand-slate">
        <span>Applied {candidate.applied}</span>
        <Button variant="ghost" size="sm" onClick={() => onAction("Open full candidate details on desktop/tablet table view.", "info")}>
          View Details
        </Button>
      </div>
    </div>
  );
}
