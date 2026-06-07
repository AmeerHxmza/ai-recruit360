"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FeedbackToast } from "@/components/ui/feedback-toast";
import { Upload } from "lucide-react";
import {
  DASHBOARD_PROFILE_KEY,
  DASHBOARD_PROFILE_UPDATED_EVENT,
  DEFAULT_DASHBOARD_PROFILE,
  type DashboardProfile,
} from "@/lib/dashboard-profile";

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialProfile = (() => {
    if (typeof window === "undefined") return DEFAULT_DASHBOARD_PROFILE;
    try {
      const rawValue = localStorage.getItem(DASHBOARD_PROFILE_KEY);
      if (!rawValue) return DEFAULT_DASHBOARD_PROFILE;
      const parsed = JSON.parse(rawValue) as Partial<DashboardProfile>;
      return {
        recruiterName: parsed.recruiterName || DEFAULT_DASHBOARD_PROFILE.recruiterName,
        recruiterEmail: parsed.recruiterEmail || DEFAULT_DASHBOARD_PROFILE.recruiterEmail,
        companyName: parsed.companyName || DEFAULT_DASHBOARD_PROFILE.companyName,
        recruiterRole: parsed.recruiterRole || DEFAULT_DASHBOARD_PROFILE.recruiterRole,
        companyLogo: parsed.companyLogo || "",
      };
    } catch {
      return DEFAULT_DASHBOARD_PROFILE;
    }
  })();

  const [companyName, setCompanyName] = useState(initialProfile.companyName);
  const [recruiterName, setRecruiterName] = useState(initialProfile.recruiterName);
  const [email, setEmail] = useState(initialProfile.recruiterEmail);
  const [companyLogo, setCompanyLogo] = useState<string>(initialProfile.companyLogo);
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error" | "info" } | null>(null);

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

  const handleSave = () => {
    if (!companyName.trim() || !recruiterName.trim() || !email.trim()) {
      setToast({ message: "Please fill all required fields.", tone: "error" });
      return;
    }
    const profileToSave: DashboardProfile = {
      recruiterName: recruiterName.trim(),
      recruiterEmail: email.trim(),
      companyName: companyName.trim(),
      recruiterRole: DEFAULT_DASHBOARD_PROFILE.recruiterRole,
      companyLogo,
    };

    localStorage.setItem(DASHBOARD_PROFILE_KEY, JSON.stringify(profileToSave));
    window.dispatchEvent(new Event(DASHBOARD_PROFILE_UPDATED_EVENT));
    setToast({ message: "Settings updated successfully.", tone: "success" });
  };

  return (
    <div className="space-y-6 lg:space-y-8">
      {toast ? <FeedbackToast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} /> : null}
      <div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Profile and Branding</CardTitle>
            <CardDescription>
              Update recruiter info, company details, and logo in one place.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Recruiter Profile</h3>
                <p className="text-sm text-muted-foreground">Update your profile and contact details.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recruiter-name">Recruiter Name</Label>
                <Input
                  id="recruiter-name"
                  value={recruiterName}
                  onChange={(event) => setRecruiterName(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="recruiter-email">Gmail</Label>
                <Input
                  id="recruiter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-5">
              <div>
                <h3 className="text-base font-semibold">Company Branding</h3>
                <p className="text-sm text-muted-foreground">Manage your company name and logo.</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Avatar className="h-14 w-14 rounded-lg">
                  <AvatarImage src={companyLogo} alt="Company Logo" />
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                    {companyName
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium">Company Logo</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, or SVG up to 2MB.</p>
                </div>
                <Button type="button" variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            <Button variant="accent" className="w-full sm:w-auto" onClick={handleSave}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you receive alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Email Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Receive daily summaries of candidate activity.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Fraud Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Immediate notification when a candidate is flagged.
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
