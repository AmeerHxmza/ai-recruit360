export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      recruiters: {
        Row: {
          id: string
          company_name: string | null
          role: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          company_name?: string | null
          role?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          company_name?: string | null
          role?: string | null
          created_at?: string | null
        }
      }
      jobs: {
        Row: {
          id: string
          recruiter_id: string | null
          title: string
          department: string | null
          description: string | null
          status: 'draft' | 'active' | 'closed' | null
          github_required: boolean | null
          knockout_enabled: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          recruiter_id?: string | null
          title: string
          department?: string | null
          description?: string | null
          status?: 'draft' | 'active' | 'closed' | null
          github_required?: boolean | null
          knockout_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          recruiter_id?: string | null
          title?: string
          department?: string | null
          description?: string | null
          status?: 'draft' | 'active' | 'closed' | null
          github_required?: boolean | null
          knockout_enabled?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      candidates: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string | null
          candidate_id: string | null
          status: 'pending' | 'screening' | 'interviewed' | 'offered' | 'rejected' | null
          cv_url: string | null
          ai_summary: string | null
          match_score: number | null
          hiring_confidence: number | null
          applied_at: string | null
        }
        Insert: {
          id?: string
          job_id?: string | null
          candidate_id?: string | null
          status?: 'pending' | 'screening' | 'interviewed' | 'offered' | 'rejected' | null
          cv_url?: string | null
          ai_summary?: string | null
          match_score?: number | null
          hiring_confidence?: number | null
          applied_at?: string | null
        }
        Update: {
          id?: string
          job_id?: string | null
          candidate_id?: string | null
          status?: 'pending' | 'screening' | 'interviewed' | 'offered' | 'rejected' | null
          cv_url?: string | null
          ai_summary?: string | null
          match_score?: number | null
          hiring_confidence?: number | null
          applied_at?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          job_id: string | null
          question_text: string
          ideal_answer: string | null
          created_at: string | null
        }
      }
      interviews: {
        Row: {
          id: string
          application_id: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'abandoned' | null
          started_at: string | null
          completed_at: string | null
          overall_score: number | null
          truthfulness_score: number | null
        }
      }
      evaluations: {
        Row: {
          id: string
          interview_id: string | null
          question_id: string | null
          candidate_answer: string | null
          ai_score: number | null
          evaluation_status: 'Excellent' | 'Strong' | 'Weak' | 'Irrelevant' | null
          ai_feedback: string | null
        }
      }
      proctor_logs: {
        Row: {
          id: string
          interview_id: string | null
          event_type: string
          description: string | null
          severity: 'info' | 'warning' | 'critical' | null
          created_at: string | null
        }
      }
      recruiter_notes: {
        Row: {
          id: string
          candidate_id: string | null
          recruiter_id: string | null
          note_content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          candidate_id?: string | null
          recruiter_id?: string | null
          note_content: string
          created_at?: string | null
        }
      }
    }
  }
}
