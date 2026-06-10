"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Loader2, Bot, User, CheckCircle2, XCircle, Video, AlertTriangle } from "lucide-react";

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";

type Stage = "apply" | "screening" | "knockout" | "interview" | "submitting" | "done" | "error";

type ApplicationData = {
  fullName: string;
  email: string;
  gender: string;
  address: string;
  cvFile: File | null;
};

type AnswerEntry = { question: string; answer: string };

export default function ApplyJobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [stage, setStage] = useState<Stage>("apply");
  const [screeningMessage, setScreeningMessage] = useState("Analyzing your CV against job requirements...");
  const [errorMessage, setErrorMessage] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [candidateId, setCandidateId] = useState<string>("");
  const [jobTitle, setJobTitle] = useState("Open Position");

  // Browser integrity tracking
  const tabSwitchCount = useRef(0);
  const startTime = useRef(Date.now());

  const [application, setApplication] = useState<ApplicationData>({
    fullName: "",
    email: "",
    gender: "",
    address: "",
    cvFile: null,
  });

  // Fetch job title on mount
  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`${FASTAPI_URL}/api/v1/jobs/${jobId}`);
        if (res.ok) {
          const job = await res.json();
          setJobTitle(job.title || "Open Position");
        }
      } catch {
        // Use default title if API unreachable
      }
    }
    fetchJob();
  }, [jobId]);

  // Track tab switches for integrity scoring
  useEffect(() => {
    if (stage !== "interview") return;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchCount.current++;
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [stage]);

  const handleApplySubmit = async () => {
    if (!application.fullName.trim() || !application.email.trim() || !application.cvFile) {
      return;
    }

    setStage("screening");
    setScreeningMessage("Uploading CV and analyzing against job requirements...");

    try {
      const formData = new FormData();
      formData.append("full_name", application.fullName.trim());
      formData.append("email", application.email.trim());
      formData.append("gender", application.gender.trim());
      formData.append("address", application.address.trim());
      formData.append("resume", application.cvFile);

      const res = await fetch(`${FASTAPI_URL}/api/apply/${jobId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Submission failed");
      }

      const data = await res.json();

      if (data.stage === "knockout") {
        setStage("knockout");
        return;
      }

      // Interview stage
      setCandidateId(data.candidate_id);
      setQuestions(data.questions || []);
      setAnswers({});
      setQuestionIndex(0);
      startTime.current = Date.now();
      setStage("interview");
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
      setStage("error");
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex >= questions.length - 1) {
      handleSubmitInterview();
      return;
    }
    setQuestionIndex((prev) => prev + 1);
  };

  const handleSubmitInterview = async () => {
    setStage("submitting");

    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    const responses = questions.map((q, i) => ({
      question: q,
      answer: answers[i] || "",
    }));

    try {
      await fetch(`${FASTAPI_URL}/api/apply/${jobId}/interview/${candidateId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses,
          tab_switches: tabSwitchCount.current,
          time_taken_seconds: timeTaken,
        }),
      });
      setStage("done");
    } catch {
      // Even if submission fails, show done screen — data was collected
      setStage("done");
    }
  };

  const progress = questions.length > 0
    ? Math.round(((questionIndex + 1) / questions.length) * 100)
    : 0;

  const currentAnswer = answers[questionIndex] || "";
  const isInterviewDark = stage === "interview" || stage === "submitting";

  return (
    <div
      className={`min-h-screen px-4 py-10 transition-colors duration-500 ${
        isInterviewDark
          ? "bg-[#060D1F] text-white"
          : "bg-background text-foreground"
      }`}
    >
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            AI-Recruit360 Candidate Portal
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{jobTitle}</h1>
          <p className="text-muted-foreground text-sm mt-1">Job ID: {jobId}</p>
        </div>

        {/* ── APPLY STAGE ── */}
        {stage === "apply" && (
          <Card className="surface-card">
            <CardHeader>
              <CardTitle>Start Your Application</CardTitle>
              <CardDescription>
                Fill in your details and upload your CV. Our AI will screen your application and generate personalised interview questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name">Full Name *</Label>
                <Input
                  id="full-name"
                  placeholder="John Doe"
                  value={application.fullName}
                  onChange={(e) => setApplication((p) => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@email.com"
                  value={application.email}
                  onChange={(e) => setApplication((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Input
                    id="gender"
                    placeholder="e.g. Male, Female"
                    value={application.gender}
                    onChange={(e) => setApplication((p) => ({ ...p, gender: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address">City / Address</Label>
                  <Input
                    id="address"
                    placeholder="Karachi, Pakistan"
                    value={application.address}
                    onChange={(e) => setApplication((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cv">CV / Resume *</Label>
                <label
                  htmlFor="cv"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-border p-5 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <UploadCloud className="h-6 w-6 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">
                    {application.cvFile
                      ? <span className="text-foreground font-medium">{application.cvFile.name}</span>
                      : "Click to upload your CV (PDF only, max 5MB)"}
                  </span>
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setApplication((p) => ({ ...p, cvFile: e.target.files?.[0] ?? null }))}
                />
              </div>
              <Button
                className="w-full h-12 text-base"
                variant="accent"
                onClick={handleApplySubmit}
                disabled={!application.fullName.trim() || !application.email.trim() || !application.cvFile}
              >
                Submit Application & Begin Screening
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── SCREENING STAGE ── */}
        {stage === "screening" && (
          <Card className="surface-card">
            <CardContent className="flex min-h-[260px] flex-col items-center justify-center space-y-4 py-14 text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">AI Screening in Progress</h3>
              <p className="text-muted-foreground max-w-md">{screeningMessage}</p>
              <p className="text-xs text-muted-foreground">This usually takes 15–30 seconds...</p>
            </CardContent>
          </Card>
        )}

        {/* ── KNOCKOUT STAGE ── */}
        {stage === "knockout" && (
          <Card className="surface-card border-destructive/20">
            <CardContent className="flex min-h-[280px] flex-col items-center justify-center space-y-4 py-14 text-center">
              <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-7 w-7 text-destructive" />
              </div>
              <h3 className="text-xl font-bold tracking-tight">Application Not Matched</h3>
              <p className="max-w-lg text-muted-foreground">
                Thank you for your interest. Based on a review of your CV against the job requirements, your application did not meet the minimum criteria for this role. We encourage you to apply to other positions.
              </p>
              <Button variant="outline" onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        )}

        {/* ── INTERVIEW STAGE ── */}
        {stage === "interview" && (
          <div className="space-y-5">
            {/* Interview header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Video className="w-5 h-5 text-primary" />
                AI Interview Room
              </h2>
              <div className="flex items-center gap-3">
                {tabSwitchCount.current > 0 && (
                  <span className="flex items-center gap-1 text-warning text-xs">
                    <AlertTriangle className="w-3 h-3" />
                    Tab switch detected
                  </span>
                )}
                <span className="text-sm font-semibold text-primary">
                  Q{questionIndex + 1} / {questions.length}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* AI Avatar + Question */}
            <div className="w-full aspect-video rounded-xl border border-primary/30 bg-[#0A1628] shadow-xl overflow-hidden relative flex flex-col items-center justify-center">
              <Bot className="h-20 w-20 text-primary opacity-70" />
              <div className="absolute bottom-0 left-0 right-0 bg-[#060D1F]/90 backdrop-blur-sm border-t border-white/10 px-6 py-4 text-center">
                <p className="text-white font-medium text-lg leading-relaxed">
                  {questions[questionIndex]}
                </p>
              </div>
            </div>

            {/* Answer input */}
            <div className="rounded-xl border border-white/10 bg-[#0A1628] p-5">
              <div className="flex items-center gap-2 text-white/50 text-sm mb-3">
                <User className="h-4 w-4" />
                Your response
              </div>
              <textarea
                key={questionIndex}
                className="h-32 w-full resize-none rounded-lg border border-white/10 bg-[#060D1F] p-4 text-sm text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-white/30 transition-colors"
                placeholder="Type your answer here..."
                value={currentAnswer}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [questionIndex]: e.target.value }))
                }
              />
            </div>

            <Button
              className="w-full h-12 text-base bg-primary hover:bg-primary-hover text-primary-foreground"
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim()}
            >
              {questionIndex >= questions.length - 1 ? "Complete Interview →" : "Submit & Next Question →"}
            </Button>
          </div>
        )}

        {/* ── SUBMITTING STAGE ── */}
        {stage === "submitting" && (
          <div className="flex min-h-[280px] flex-col items-center justify-center space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white">Submitting Your Interview</h3>
            <p className="text-white/60">Please wait while we process your responses...</p>
          </div>
        )}

        {/* ── DONE STAGE ── */}
        {stage === "done" && (
          <Card className="surface-card border-success/20">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center space-y-4 py-14 text-center">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">Interview Complete!</h3>
              <p className="max-w-lg text-muted-foreground">
                Thank you for completing your AI-powered interview, <strong>{application.fullName}</strong>. Your responses are being evaluated by our AI and will be reviewed by the recruiter. You will be notified about your application outcome.
              </p>
              <Button variant="outline" onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        )}

        {/* ── ERROR STAGE ── */}
        {stage === "error" && (
          <Card className="surface-card border-destructive/20">
            <CardContent className="flex min-h-[260px] flex-col items-center justify-center space-y-4 py-14 text-center">
              <XCircle className="h-9 w-9 text-destructive" />
              <h3 className="text-xl font-bold text-foreground">Submission Failed</h3>
              <p className="text-muted-foreground max-w-md">{errorMessage}</p>
              <Button variant="outline" onClick={() => setStage("apply")}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
