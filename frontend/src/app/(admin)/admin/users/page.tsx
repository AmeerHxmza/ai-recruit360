'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Zap,
  PlusCircle,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  RotateCcw
} from 'lucide-react';

interface RecruiterUser {
  id: string;
  full_name: string;
  company_name: string;
  role: string;
  is_allowed: boolean;
  credits_balance: number;
  total_credits_used: number;
  total_ai_tokens_used: number;
  total_ai_cost_usd: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<RecruiterUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<RecruiterUser | null>(null);
  const [topupAmount, setTopupAmount] = useState(50);
  const [topupLoading, setTopupLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers();
      setUsers(data.users || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (user: RecruiterUser) => {
    const newStatus = !user.is_allowed;
    try {
      await api.toggleUserStatus(user.id, newStatus);
      setActionMessage(`Recruiter '${user.full_name}' ${newStatus ? 'enabled' : 'suspended'}.`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_allowed: newStatus } : u))
      );
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleTopupCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      setTopupLoading(true);
      const updated = await api.topupUserCredits(selectedUser.id, topupAmount);
      setActionMessage(`Added ${topupAmount} credits to '${selectedUser.full_name}'.`);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, credits_balance: updated.user.credits_balance } : u
        )
      );
      setSelectedUser(null);
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to top up credits');
    } finally {
      setTopupLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            User Governance & Access Control
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage recruiter access status (<code className="text-purple-400">is_allowed</code>), monitor credit usage, and top up balance.
          </p>
        </div>
        <button
          onClick={loadUsers}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-500" />
        <input
          type="text"
          placeholder="Search by recruiter name, company, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center space-x-3">
            <Activity className="w-5 h-5 animate-spin text-purple-400" />
            <span>Loading Recruiter User Directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No recruiter user accounts found matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                <tr>
                  <th className="px-6 py-4">Recruiter / Organization</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status (is_allowed)</th>
                  <th className="px-6 py-4">Credits Balance</th>
                  <th className="px-6 py-4">Tokens Used</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{user.full_name || 'Recruiter'}</div>
                      <div className="text-xs text-slate-400">{user.company_name || 'Organization'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center text-[11px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                          user.role === 'admin'
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                            : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                      >
                        {user.role || 'recruiter'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_allowed ? (
                        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-full">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Suspended</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5 font-bold text-white">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>{user.credits_balance ?? 100}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {(user.total_ai_tokens_used || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {/* Topup Button */}
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg text-xs font-medium transition"
                      >
                        + Add Credits
                      </button>

                      {/* Toggle Status Button */}
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                          user.is_allowed
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {user.is_allowed ? 'Block Access' : 'Allow Access'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credit Topup Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Top Up Candidate Evaluation Credits</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400">Recruiter Account:</p>
              <p className="text-base font-bold text-white">{selectedUser.full_name}</p>
              <p className="text-xs text-purple-400 mt-1">
                Current Balance: <strong>{selectedUser.credits_balance} Credits</strong>
              </p>
            </div>

            <form onSubmit={handleTopupCredits} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Credits to Add
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={topupLoading}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-600/30 transition disabled:opacity-50"
                >
                  {topupLoading ? 'Adding...' : 'Confirm Top Up'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
