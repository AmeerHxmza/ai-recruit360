import { createClient } from '@/lib/supabase/client';

const FASTAPI_BASE_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

/**
 * Type-safe fetch wrapper for AI-Recruit360 FastAPI Backend endpoints (/api/v1).
 * Automatically injects Supabase JWT Bearer token headers when authenticated.
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Attach Authorization Bearer token if user is logged in
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // Set default Content-Type to application/json unless body is FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Support both /api/v1 and legacy /api routes
  const url = cleanEndpoint.startsWith('/api')
    ? `${FASTAPI_BASE_URL}${cleanEndpoint}`
    : `${FASTAPI_BASE_URL}/api/v1${cleanEndpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorDetail = responseData.detail || responseData.error || response.statusText;
    throw new Error(typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail));
  }

  return responseData as T;
}

// Helper API functions
export const api = {
  // Jobs API
  getJobs: () => apiFetch('/jobs'),
  createJob: (payload: { title: string; description: string; department?: string; min_experience?: number; duration_days?: number }) =>
    apiFetch('/jobs', { method: 'POST', body: JSON.stringify(payload) }),
  enhanceJob: (payload: { title: string; department?: string; description?: string }) =>
    apiFetch('/jobs/enhance', { method: 'POST', body: JSON.stringify(payload) }),
  deleteJob: (jobId: string) =>
    apiFetch(`/jobs/${jobId}`, { method: 'DELETE' }),
  exportJobCandidatesCsv: (jobId: string) =>
    apiFetch(`/jobs/${jobId}/export`),

  // Candidates API
  getLeaderboard: (jobId: string) =>
    apiFetch(`/candidates?job_id=${jobId}`),
  getCandidateDeepDive: (candidateId: string) =>
    apiFetch(`/candidates/${candidateId}`),
  sendInterviewInvite: (payload: { candidate_ids: string[]; subject: string; custom_message: string; template_type?: string; interview_date_location?: string }) =>
    apiFetch('/candidates/send-interview-invite', { method: 'POST', body: JSON.stringify(payload) }),

  // Apply API (FormData with PDF)
  submitApplication: (jobId: string, formData: FormData) =>
    apiFetch(`/apply/${jobId}`, { method: 'POST', body: formData }),

  // Interview Room API
  getNextQuestion: (candidateId: string) =>
    apiFetch(`/interview/${candidateId}/next`),
  submitAnswer: (candidateId: string, answer: string) =>
    apiFetch(`/interview/${candidateId}/answer`, { method: 'POST', body: JSON.stringify({ answer }) }),
  getAvatarSession: (candidateId: string, faceId?: string) =>
    apiFetch('/interview/avatar-session', { method: 'POST', body: JSON.stringify({ candidate_id: candidateId, face_id: faceId }) }),

  // Anti-Cheat Proctoring API
  logProctorEvent: (candidateId: string, eventType: string, description?: string) =>
    apiFetch(`/proctor/${candidateId}/log`, { method: 'POST', body: JSON.stringify({ event_type: eventType, description }) }),

  // Super Admin API
  getAdminOverview: () => apiFetch('/admin/overview'),
  getAdminUsers: () => apiFetch('/admin/users'),
  toggleUserStatus: (userId: string, isAllowed: boolean) =>
    apiFetch(`/admin/users/${userId}/status`, { method: 'PATCH', body: JSON.stringify({ is_allowed: isAllowed }) }),
  topupUserCredits: (userId: string, creditsToAdd: number) =>
    apiFetch(`/admin/users/${userId}/topup`, { method: 'POST', body: JSON.stringify({ credits_to_add: creditsToAdd }) }),
};
