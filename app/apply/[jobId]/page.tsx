"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, Loader2, Bot, User, CheckCircle2, XCircle, Video } from "lucide-react";

type Stage = "apply" | "screening" | "knockout" | "interview" | "done";

type ApplicationData = {
  fullName: string;
  email: string;
  gender: string;
  address: string;
  cvFile: File | null;
};

const JOBS: Record<string, { title: string; keywords: string[] }> = {
  "1": { title: "Senior React Developer", keywords: ["react", "typescript", "frontend", "javascript"] },
  "2": { title: "Product Designer", keywords: ["design", "figma", "ux", "ui"] },
  "3": { title: "DevOps Engineer", keywords: ["devops", "aws", "kubernetes", "docker"] },
};
const FRONTEND_MOCK_MODE = true;

export default function ApplyJobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId as string;
  const job = JOBS[jobId] ?? { title: "Open Position", keywords: ["experience"] };

  const [stage, setStage] = useState<Stage>("apply");
  const [screeningMessage, setScreeningMessage] = useState("Analyzing CV against job requirements...");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [application, setApplication] = useState<ApplicationData>({
    fullName: "",
    email: "",
    gender: "",
    address: "",
    cvFile: null,
  });

  const questions = useMemo(
    () => [
      `Hi ${application.fullName || "candidate"}, please introduce yourself in 60 seconds.`,
      "Walk me through the most relevant project from your CV.",
      "Which achievement in your CV best proves your impact?",
      "What tools and technologies do you use most confidently?",
      "Describe a challenge you solved and what you learned.",
      `How does your experience fit this ${job.title} role?`,
      "How do you collaborate with team members under deadlines?",
      "Tell me about a mistake you made and how you corrected it.",
      "What are your compensation and availability expectations?",
      "Why should we shortlist you for the onsite interview?",
    ],
    [application.fullName, job.title]
  );

  const evaluateCvMatch = () => {
    if (FRONTEND_MOCK_MODE) return true;
    const resumeText = `${application.cvFile?.name ?? ""} ${application.address}`.toLowerCase();
    return job.keywords.some((keyword) => resumeText.includes(keyword));
  };

  const handleApplySubmit = () => {
    if (!application.fullName.trim() || !application.email.trim() || !application.gender.trim() || !application.address.trim() || !application.cvFile) {
      return;
    }
    setStage("screening");
    setTimeout(() => {
      const isMatch = evaluateCvMatch();
      if (isMatch) {
        setScreeningMessage(
          FRONTEND_MOCK_MODE
            ? "Frontend mock mode: CV accepted. Proceeding to AI interview..."
            : "CV matched. Proceeding to AI interview..."
        );
        setStage("interview");
      } else {
        setScreeningMessage("CV did not match minimum criteria.");
        setStage("knockout");
      }
    }, 1800);
  };

  const handleNextQuestion = () => {
    if (questionIndex >= questions.length - 1) {
      setStage("done");
      return;
    }
    setQuestionIndex((prev) => prev + 1);
  };

  const progress = Math.round(((questionIndex + 1) / questions.length) * 100);

  return (
    <div className={`min-h-screen px-4 py-10 transition-colors duration-500 ${stage === "interview" ? "bg-brand-navy text-brand-white" : "bg-brand-light text-brand-navy"}`}>
      <div className="mx-auto w-full max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-cyan">AI-Recruit360 Candidate Portal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">{job.title}</h1>
          <p className={`mt-1 ${stage === "interview" ? "text-brand-slate" : "text-brand-slate"}`}>Job ID: {jobId}</p>
        </div>

        {stage === "apply" && (
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="tracking-tight text-brand-navy">Start Application</CardTitle>
              <CardDescription className="text-brand-slate">Upload your profile details and CV to begin screening.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="full-name" className="text-brand-navy">Full Name</Label>
                <Input id="full-name" className="border-gray-200 focus-visible:ring-brand-cyan" value={application.fullName} onChange={(e) => setApplication((prev) => ({ ...prev, fullName: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-brand-navy">Email</Label>
                <Input id="email" type="email" className="border-gray-200 focus-visible:ring-brand-cyan" value={application.email} onChange={(e) => setApplication((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender" className="text-brand-navy">Gender</Label>
                <Input id="gender" className="border-gray-200 focus-visible:ring-brand-cyan" placeholder="e.g. Male, Female, Prefer not to say" value={application.gender} onChange={(e) => setApplication((prev) => ({ ...prev, gender: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-brand-navy">Address</Label>
                <Input id="address" className="border-gray-200 focus-visible:ring-brand-cyan" value={application.address} onChange={(e) => setApplication((prev) => ({ ...prev, address: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cv" className="text-brand-navy">CV Upload</Label>
                <label htmlFor="cv" className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-gray-300 p-4 hover:bg-brand-light">
                  <UploadCloud className="h-5 w-5 text-brand-cyan" />
                  <span className="text-sm text-brand-navy">
                    {application.cvFile ? application.cvFile.name : "Click to upload your CV (PDF/DOCX)"}
                  </span>
                </label>
                <input
                  id="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setApplication((prev) => ({ ...prev, cvFile: e.target.files?.[0] ?? null }))}
                />
              </div>
              <Button className="w-full bg-brand-cyan text-brand-white hover:bg-brand-cyan/90 rounded-md shadow-sm" onClick={handleApplySubmit}>
                Submit and Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {stage === "screening" && (
          <Card className="surface-card">
            <CardContent className="flex min-h-[220px] flex-col items-center justify-center space-y-3 py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand-cyan" />
              <h3 className="text-xl font-semibold tracking-tight text-brand-navy">CV Screening in Progress</h3>
              <p className="text-brand-slate">{screeningMessage}</p>
            </CardContent>
          </Card>
        )}

        {stage === "knockout" && (
          <Card className="surface-card border-brand-archived/30">
            <CardContent className="flex min-h-[260px] flex-col items-center justify-center space-y-3 py-12 text-center">
              <XCircle className="h-10 w-10 text-brand-archived" />
              <h3 className="text-xl font-semibold tracking-tight text-brand-navy">Application Not Matched</h3>
              <p className="max-w-lg text-brand-slate">
                Thank you for applying. Based on current job requirements, your CV did not match minimum criteria for this role.
              </p>
              <Button variant="outline" className="border-gray-200 text-brand-navy hover:bg-brand-light" onClick={() => router.push("/")}>Exit Platform</Button>
            </CardContent>
          </Card>
        )}

        {stage === "interview" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <Video className="w-5 h-5 text-brand-cyan" />
                AI Interview Room
              </h2>
              <span className="text-sm font-medium text-brand-cyan">Question {questionIndex + 1} of {questions.length}</span>
            </div>

            <div className="h-2 w-full overflow-hidden rounded-full bg-brand-slate/20">
              <div className="h-full bg-brand-cyan transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>

            {/* Cyan-bordered video container */}
            <div className="w-full aspect-video rounded-md border-2 border-brand-cyan bg-[#091124] shadow-sm overflow-hidden relative flex flex-col items-center justify-center">
              <Bot className="h-24 w-24 text-brand-cyan opacity-80" />
              <div className="absolute bottom-6 w-[90%] max-w-lg bg-[#0F172A]/90 border border-brand-cyan/30 backdrop-blur-md px-6 py-4 rounded-md shadow-lg text-center">
                <p className="text-brand-white font-medium text-lg">{questions[questionIndex]}</p>
              </div>
            </div>

            <div className="rounded-md border border-brand-slate/30 bg-[#0b1221] p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-brand-slate">
                <User className="h-4 w-4" />
                <p className="font-medium text-sm">Your response</p>
              </div>
              <textarea
                className="h-32 w-full resize-none rounded-md border border-brand-slate/50 bg-[#0F172A] p-4 text-sm text-brand-white outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan placeholder:text-brand-slate"
                placeholder="Type your answer here..."
              />
            </div>
            <Button className="w-full bg-brand-cyan hover:bg-brand-cyan/90 text-brand-white font-medium rounded-md shadow-sm h-12 text-base" onClick={handleNextQuestion}>
              {questionIndex >= questions.length - 1 ? "Complete Interview" : "Submit & Continue"}
            </Button>
          </div>
        )}

        {stage === "done" && (
          <Card className="surface-card border-brand-success/30">
            <CardContent className="flex min-h-[300px] flex-col items-center justify-center space-y-4 py-14 text-center">
              <CheckCircle2 className="h-10 w-10 text-brand-success" />
              <h3 className="text-2xl font-semibold tracking-tight text-brand-navy">Interview Completed</h3>
              <p className="max-w-xl text-brand-slate">
                Thank you for completing your AI interview. We will inform you about invitation or rejection for the onsite real interview.
                Your application data has been submitted to the recruiter dashboard.
              </p>
              <Button variant="outline" className="border-gray-200 text-brand-navy hover:bg-brand-light" onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
