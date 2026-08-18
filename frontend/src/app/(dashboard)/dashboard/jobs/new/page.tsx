'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  Briefcase,
  Sparkles,
  ArrowLeft,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  Zap,
  Activity
} from 'lucide-react';

export default function NewJobPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [minExperience, setMinExperience] = useState(2);
  const [durationDays, setDurationDays] = useState(30);
  const [description, setDescription] = useState('');

  const [enhancing, setEnhancing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleEnhanceDescription = async () => {
    if (!title.trim()) {
      setError('Please enter a Job Title before enhancing.');
      return;
    }
    try {
      setError('');
      setEnhancing(true);
      const res = await api.enhanceJob({
        title,
        department,
        description,
      });
      if (res.enhanced_description) {
        setDescription(res.enhanced_description);
      }
    } catch (err: any) {
      setError(err.message || 'AI Enhancement failed. Please check backend.');
    } finally {
      setEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and Job Description are required.');
      return;
    }

    try {
      setError('');
      setSubmitting(true);
      await api.createJob({
        title,
        department,
        description,
        min_experience: minExperience,
        duration_days: durationDays,
      });
      router.push('/dashboard/jobs');
    } catch (err: any) {
      setError(err.message || 'Failed to create job posting.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Back Button & Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-xl shadow-xs transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Job Posting</h1>
          <p className="text-xs text-gray-500">
            Define requirements and generate dynamic AI screening criteria. (Consumes 5 Credits)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Job Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Full-Stack Engineer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none transition"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none transition"
            >
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Design">Design</option>
              <option value="Data Science">Data Science</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
            </select>
          </div>

          {/* Minimum Experience */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Minimum Experience (Years)
            </label>
            <input
              type="number"
              min="0"
              max="20"
              value={minExperience}
              onChange={(e) => setMinExperience(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none transition"
            />
          </div>

          {/* Duration Days Expiration */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Job Active Duration (Days)</span>
              <span className="text-[10px] text-indigo-600 font-mono">Auto Expiration</span>
            </label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none transition"
            >
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (2 Weeks)</option>
              <option value={30}>30 Days (1 Month)</option>
              <option value={60}>60 Days (2 Months)</option>
              <option value={90}>90 Days (3 Months)</option>
            </select>
          </div>
        </div>

        {/* Job Description & AI Enhancer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Job Description &amp; Screening Requirements *
            </label>
            <button
              type="button"
              onClick={handleEnhanceDescription}
              disabled={enhancing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-purple-500/20 transition disabled:opacity-50"
            >
              {enhancing ? (
                <>
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  <span>Enhancing with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Enhance Description</span>
                </>
              )}
            </button>
          </div>
          <textarea
            rows={12}
            placeholder="Type rough notes or click 'AI Enhance Description' to auto-generate a structured Job Description with Role Overview, Responsibilities, Tech Stack, and Hard Knockout Criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#4361EE] focus:outline-none transition leading-relaxed"
            required
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#4361EE] hover:bg-[#3451d1] text-white rounded-xl text-xs font-bold shadow-lg shadow-[#4361EE]/30 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Publishing Job...</span>
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4" />
                <span>Publish Job Posting (5 Credits)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
