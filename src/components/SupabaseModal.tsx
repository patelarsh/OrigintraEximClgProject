import React, { useState } from 'react';
import { Database, Cloud, Check, AlertCircle, RefreshCw, X, Download, ShieldCheck, Key, ExternalLink } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { AdminStorage } from '../services/adminStorage';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [url, setUrl] = useState(() => supabase.getConfig().url);
  const [anonKey, setAnonKey] = useState(() => supabase.getConfig().anonKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; counts?: Record<string, number> } | null>(null);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({ ok: false, message: 'Please enter both Supabase Project URL and Anon Public Key.' });
      return;
    }
    setTesting(true);
    setTestResult(null);

    // Temporarily apply to test
    const oldConfig = supabase.getConfig();
    supabase.setConfig(url, anonKey);

    const res = await supabase.testConnection();
    setTestResult(res);

    if (!res.ok) {
      // Revert if failed
      if (oldConfig.url) {
        supabase.setConfig(oldConfig.url, oldConfig.anonKey);
      } else {
        supabase.clearConfig();
      }
    }
    setTesting(false);
  };

  const handleSave = async () => {
    if (!url || !anonKey) {
      alert('Please provide both Project URL and Anon Key.');
      return;
    }

    supabase.setConfig(url, anonKey);
    const res = await supabase.testConnection();

    if (res.ok) {
      await AdminStorage.syncWithDatabase();
      onSuccess('Connected to Supabase PostgreSQL! Real-time cloud sync active.');
      onClose();
    } else {
      setTestResult(res);
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect Supabase? Local cache and fallback storage will be used.')) {
      supabase.clearConfig();
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      AdminStorage.fetchDatabaseStatus();
      onSuccess('Supabase disconnected. Switched to local storage.');
      onClose();
    }
  };

  const handleDownloadSql = () => {
    // Trigger download of supabase_schema.sql
    const a = document.createElement('a');
    a.href = '/supabase_schema.sql';
    a.download = 'supabase_schema.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isConfigured = supabase.isConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl overflow-hidden max-w-xl w-full shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0A1C3E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                <span>Connect Supabase Database</span>
                {isConfigured ? (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Live
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Setup Required
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Cloud PostgreSQL database for commodities, inquiries, blogs & admin users
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Quick Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Cloud className="w-4 h-4 text-emerald-600" />
                How to connect your free Supabase project:
              </span>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
              >
                Open Supabase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="text-xs text-slate-600 space-y-1 pl-4 list-decimal">
              <li>Log in to <span className="font-semibold text-slate-800">supabase.com</span> and create a new project.</li>
              <li>Open <strong>Project Settings ➔ Data API</strong> (or API) and copy your <strong>Project URL</strong> &amp; <strong>anon public key</strong>.</li>
              <li>Open the <strong>SQL Editor</strong> in Supabase, paste <button type="button" onClick={handleDownloadSql} className="text-blue-600 underline font-semibold cursor-pointer">supabase_schema.sql</button> and click <strong>Run</strong>.</li>
              <li>Paste the URL and Anon Key below and click <strong>Save &amp; Connect</strong>!</li>
            </ol>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Supabase Project URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-project-id.supabase.co"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Supabase Anon Public Key</span>
                <span className="text-[10px] text-slate-400 font-normal normal-case">anon / public role key</span>
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Test Result Message */}
          {testResult && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
              testResult.ok 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {testResult.ok ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold">{testResult.message}</div>
                {testResult.counts ? (
                  <div className="text-[11px] text-emerald-700 flex flex-wrap gap-2">
                    <span>Products: {testResult.counts.products ?? 0}</span> •
                    <span>Inquiries: {testResult.counts.inquiries ?? 0}</span> •
                    <span>Articles: {testResult.counts.blog_posts ?? 0}</span> •
                    <span>Team: {testResult.counts.team_members ?? 0}</span>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Download SQL Helper */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Need to create the tables in your Supabase project?
            </div>
            <a
              href="/supabase_schema.sql"
              download="supabase_schema.sql"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download SQL Setup</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {isConfigured ? (
            <button
              type="button"
              onClick={handleDisconnect}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              Disconnect Supabase
            </button>
          ) : <div />}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save &amp; Connect</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
