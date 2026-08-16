"use client";

import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Upload, Settings as SettingsIcon, Sparkles } from "lucide-react";
import {
  DASHBOARD_PROFILE_KEY,
  DEFAULT_DASHBOARD_PROFILE,
  type DashboardProfile,
} from "@/lib/dashboard-profile";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [email, setEmail] = useState("");
  const [companyLogo, setCompanyLogo] = useState<string>("");
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setRecruiterName(user.user_metadata?.full_name || "");
        setCompanyName(user.user_metadata?.company_name || "");
        setEmail(user.email || "");
        
        const rawValue = localStorage.getItem(DASHBOARD_PROFILE_KEY);
        if (rawValue) {
          try {
            const parsed = JSON.parse(rawValue);
            setCompanyLogo(parsed.companyLogo || "");
          } catch {}
        }
      }
      setIsLoading(false);
    }
    loadProfile();
  }, []);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ message: "Please upload an image file.", tone: "error" });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setCompanyLogo(imageUrl);
    setToast({ message: "Logo selected. Save changes to apply.", tone: "info" });
  };

  const handleSave = async () => {
    if (!companyName.trim() || !recruiterName.trim()) {
      setToast({ message: "Please fill all required fields.", tone: "error" });
      return;
    }
    
    setIsSaving(true);
    
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: recruiterName.trim(),
        company_name: companyName.trim()
      }
    });

    if (error) {
      setToast({ message: "Failed to update profile.", tone: "error" });
      setIsSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("recruiters").update({
        company_name: companyName.trim()
      }).eq("id", user.id);
    }

    const profileToSave: DashboardProfile = {
      recruiterName: recruiterName.trim(),
      recruiterEmail: email.trim(),
      companyName: companyName.trim(),
      recruiterRole: DEFAULT_DASHBOARD_PROFILE.recruiterRole,
      companyLogo,
    };
    localStorage.setItem(DASHBOARD_PROFILE_KEY, JSON.stringify(profileToSave));
    
    router.refresh();
    
    setIsSaving(false);
    setToast({ message: "Settings updated successfully.", tone: "success" });
  };

  if (isLoading) {
    return <div className="p-12 text-center text-xs font-mono text-[#6B7280]">Loading workspace settings...</div>;
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
      
      <div className="border-b border-gray-200 pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1.5">
          <SettingsIcon className="w-3.5 h-3.5 text-[#4361EE]" strokeWidth={2} />
          <span>System Configuration</span>
        </div>
        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">Workspace Settings</h1>
        <p className="font-sans text-xs text-[#6B7280] mt-1">
          Manage your recruiter workspace credentials, company profile, and anti-cheat telemetry.
        </p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h3 className="font-display text-lg font-bold text-[#1F2937]">Profile &amp; Organization</h3>
            <p className="font-sans text-xs text-[#6B7280]">Update recruiter details and company workspace settings.</p>
          </div>

          <div className="space-y-5">
            <div className="grid gap-1.5">
              <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Recruiter Full Name *</label>
              <input
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="w-full h-11 px-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Work Email Address</label>
              <input
                value={email}
                disabled
                className="w-full h-11 px-4 text-xs font-sans rounded-lg border border-gray-200 text-[#6B7280] bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="font-mono text-xs uppercase font-bold text-[#1F2937]">Company / Organization Name *</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full h-11 px-4 text-xs font-sans rounded-lg border border-gray-200 text-[#1F2937] focus:ring-2 focus:ring-[#4361EE] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#4361EE] hover:bg-[#3A56D4] text-white text-xs font-bold py-2.5 px-6 rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? "Saving Changes..." : "Save Workspace Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
