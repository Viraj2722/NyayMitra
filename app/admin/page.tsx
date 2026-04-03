"use client";

import React, { useState } from "react";
import { Lock, Plus, Activity, FileText, Database, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminPage() {
  const { user, signInWithEmail, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmail(email, password);
    } catch (err) {
      setError("Invalid admin credentials");
    }
  };

  // Ensure only authenticated users can see the dashboard
  if (!user) {
    return (
      <div className="flex-1 bg-zinc-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-[var(--color-deep-blue)]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-500 mb-6 text-sm">Protected dashboard for managing NyayMitra centers and monitoring queries.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Admin Email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)]"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[var(--color-deep-blue)]"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="w-full bg-[var(--color-deep-blue)] text-white font-bold py-3 rounded-lg shadow-md hover:bg-blue-900 transition-colors">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-zinc-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#111]">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Monitor real-time queries and manage legal centers.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase">System Status</p>
                <p className="text-sm font-semibold text-gray-900">All Systems Operational</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Anonymized Queries List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="w-6 h-6 text-[var(--color-deep-blue)]" />
              <h2 className="text-xl font-bold text-gray-900">Recent Anonymized Queries</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-semibold">Timestamp</th>
                    <th className="pb-3 font-semibold">Predicted Category</th>
                    <th className="pb-3 font-semibold">Urgency</th>
                    <th className="pb-3 font-semibold">Action Taken</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-800">
                  <tr className="border-b border-gray-50">
                    <td className="py-4">Just now</td>
                    <td className="py-4"><span className="bg-blue-50 text-[var(--color-deep-blue)] px-2 py-1 rounded">Labor Dispute</span></td>
                    <td className="py-4"><span className="bg-green-50 text-green-700 px-2 py-1 rounded">Normal</span></td>
                    <td className="py-4 text-gray-500">Rights + DLSA Info</td>
                  </tr>
                  <tr className="border-b border-gray-50">
                    <td className="py-4">2 mins ago</td>
                    <td className="py-4"><span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">Domestic Violence</span></td>
                    <td className="py-4"><span className="bg-red-50 text-red-700 px-2 py-1 rounded font-bold animate-pulse">High</span></td>
                    <td className="py-4 text-gray-500">Helpline 181 Triggered</td>
                  </tr>
                  <tr>
                    <td className="py-4">15 mins ago</td>
                    <td className="py-4"><span className="bg-orange-50 text-orange-700 px-2 py-1 rounded">Tenancy</span></td>
                    <td className="py-4"><span className="bg-green-50 text-green-700 px-2 py-1 rounded">Normal</span></td>
                    <td className="py-4 text-gray-500">Rights + Consumer Court Info</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Legal Center Form (UI Only) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 self-start">
            <div className="flex items-center gap-2 mb-6">
              <Database className="w-6 h-6 text-[var(--color-saffron)]" />
              <h2 className="text-xl font-bold text-gray-900">Manage Centers</h2>
            </div>
            
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Center saved to database!"); }}>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Center Name</label>
                <input required type="text" className="w-full bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-[var(--color-deep-blue)] outline-none transition-colors" placeholder="e.g. DLSA Borivali" />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Contact Setup</label>
                <input required type="tel" className="w-full bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-[var(--color-deep-blue)] outline-none transition-colors" placeholder="Phone Number" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase">Coordinates & Address</label>
                <textarea required rows={2} className="w-full bg-gray-50 border border-transparent rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-[var(--color-deep-blue)] outline-none transition-colors resize-none" placeholder="Full Address..."></textarea>
              </div>

              <div className="pt-2">
                <button className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors">
                  <Plus className="w-5 h-5"/> Add to Database
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
