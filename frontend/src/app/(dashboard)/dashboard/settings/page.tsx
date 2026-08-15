"use client";

import { useEffect, useRef, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Upload, Settings as SettingsIcon } from "lucide-react";
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
    return <div className="p-8 text-center text-xs font-mono text-[#66707F]">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 pb-12 font-sans">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
      
      <div className="border-b border-[rgba(148,163,184,0.12)] pb-6">
        <div className="eyebrow flex items-center gap-2 mb-1">
          <SettingsIcon className="w-3.5 h-3.5 text-[#8AB4F8]" strokeWidth={1.75} />
          <span>System Configuration</span>
        </div>
        <h2 className="font-display text-3xl font-medium text-[#F2F5F9]">Settings</h2>
        <p className="font-sans text-xs text-[#9AA6B8] mt-1">
          Manage your recruiter workspace credentials, company details, and alerts.
        </p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        <div className="card-enterprise space-y-6">
          <div className="border-b border-[rgba(148,163,184,0.12)] pb-4">
            <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Profile &amp; Branding</h3>
            <p className="font-sans text-xs text-[#9AA6B8]">Update recruiter details and company workspace settings.</p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="eyebrow">Recruiter Name *</label>
              <input
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                className="input-enterprise h-10"
              />
            </div>
            <div className="grid gap-2">
              <label className="eyebrow">Email Account</label>
              <input
                type="email"
                value={email}
                disabled
                className="input-enterprise h-10 opacity-60 cursor-not-allowed"
              />
            </div>
            <div className="grid gap-2">
              <label className="eyebrow">Company Name *</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-enterprise h-10"
              />
            </div>

            <div className="flex items-center gap-4 rounded-[8px] border border-[rgba(148,163,184,0.12)] bg-[#0B1019] p-4">
              <Avatar className="h-12 w-12 rounded-[8px]">
                <AvatarImage src={companyLogo} alt="Company Logo" />
                <AvatarFallback className="bg-[rgba(138,180,248,0.10)] text-[#8AB4F8] font-mono text-xs font-medium">
                  {companyName
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-sans text-xs font-medium text-[#F2F5F9]">Company Logo</p>
                <p className="font-mono text-[11px] text-[#66707F]">PNG, JPG up to 2MB</p>
              </div>
              <button type="button" className="btn-secondary text-xs" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
                Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </div>
          </div>

          <button className="btn-primary text-xs h-10 px-6" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving Changes..." : "Save Workspace Profile"}
          </button>
        </div>

        <div className="card-enterprise space-y-6">
          <div className="border-b border-[rgba(148,163,184,0.12)] pb-4">
            <h3 className="font-display text-lg font-medium text-[#F2F5F9]">Notifications &amp; Telemetry</h3>
            <p className="font-sans text-xs text-[#9AA6B8]">Configure real-time candidate alert preferences.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-[8px] border border-[rgba(148,163,184,0.12)] bg-[#0B1019] p-4">
              <div className="space-y-0.5">
                <p className="font-sans text-xs font-medium text-[#F2F5F9]">Daily Executive Summaries</p>
                <p className="font-sans text-[11px] text-[#9AA6B8]">Receive automated applicant pipeline reports.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-[8px] border border-[rgba(148,163,184,0.12)] bg-[#0B1019] p-4">
              <div className="space-y-0.5">
                <p className="font-sans text-xs font-medium text-[#F2F5F9]">Real-time Proctoring Alerts</p>
                <p className="font-sans text-[11px] text-[#9AA6B8]">Flag suspicious tab switches during live candidate sessions.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
