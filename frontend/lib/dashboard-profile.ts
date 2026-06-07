export const DASHBOARD_PROFILE_KEY = "ai-recruit360:dashboard-profile";
export const DASHBOARD_PROFILE_UPDATED_EVENT = "dashboard-profile-updated";

export type DashboardProfile = {
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  recruiterRole: string;
  companyLogo: string;
};

export const DEFAULT_DASHBOARD_PROFILE: DashboardProfile = {
  recruiterName: "Alex Morgan",
  recruiterEmail: "alex.morgan@company.com",
  companyName: "Acme Corp",
  recruiterRole: "Senior Recruiter",
  companyLogo: "",
};

