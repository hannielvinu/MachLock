import React, { useEffect, useState } from 'react';
import { ShieldCheck, Download, RefreshCw, FileText, CheckCircle, Database } from 'lucide-react';
import { RaceTestResult } from '../types';

export const EvidencePage: React.FC = () => {
  const [evidenceData, setEvidenceData] = useState<{
    hard_claim: string;
    test_runs: RaceTestResult[];
    metrics: any;
  } | null>(null);

  const fetchEvidence = () => {
    fetch('/api/evidence')
      .then((res) => res.json())
      .then((data) => setEvidenceData(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  return (
    <div className="flex-1 p-8 space-y-6 overflow-y-auto font-sans bg-app-bg">
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-status-success flex items-center justify-center border border-emerald-200 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black font-mono text-text-primary tracking-wider uppercase">
              EVIDENCE & REPRODUCIBILITY DASHBOARD
            </h2>
            <p className="text-xs text-text-secondary mt-0.5 font-medium font-sans">
              "Every claim is backed by persistent deterministic SQLite evidence and repeatable acceptance tests."
            </p>
          </div>
        </div>

        <button
          onClick={fetchEvidence}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-app-border text-xs font-mono font-bold text-text-secondary flex items-center space-x-2 shadow-subtle transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>REFRESH EVIDENCE</span>
        </button>
      </div>

      {/* Hard Claim Box */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-6 space-y-2 shadow-subtle">
        <span className="text-[10px] font-mono font-extrabold uppercase text-aviation-blue tracking-wider">
          PRIMARY SCIENTIFIC ACCEPTANCE CLAIM
        </span>
        <blockquote className="text-base font-sans font-bold text-slate-900 leading-snug">
          "{evidenceData?.hard_claim || 'Obsolete voice and obsolete procedure state cannot survive a user interruption.'}"
        </blockquote>
      </div>

      {/* Aggregate Metrics Grid */}
      <div className="grid grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-white border border-app-border rounded-2xl p-5 shadow-card">
          <div className="text-text-muted text-[10px] font-bold">TOTAL BENCHMARK RUNS</div>
          <div className="text-3xl font-black text-aviation-blue mt-1.5">
            {evidenceData?.metrics?.total_runs ?? 0}
          </div>
        </div>

        <div className="bg-white border border-app-border rounded-2xl p-5 shadow-card">
          <div className="text-text-muted text-[10px] font-bold">STALE COMMITS PREVENTED</div>
          <div className="text-3xl font-black text-emerald-600 mt-1.5">
            {evidenceData?.metrics?.stale_commits_prevented ?? 0}
          </div>
        </div>

        <div className="bg-white border border-app-border rounded-2xl p-5 shadow-card">
          <div className="text-text-muted text-[10px] font-bold">TIME-TO-MUTE (P50)</div>
          <div className="text-xs font-bold text-amber-700 mt-3 font-sans bg-amber-50 p-2 rounded-lg border border-amber-200">
            NOT YET MEASURED (LIVE ACOUSTIC TEST REQUIRED)
          </div>
        </div>

        <div className="bg-white border border-app-border rounded-2xl p-5 shadow-card">
          <div className="text-text-muted text-[10px] font-bold">TIME-TO-MUTE (P95)</div>
          <div className="text-xs font-bold text-amber-700 mt-3 font-sans bg-amber-50 p-2 rounded-lg border border-amber-200">
            NOT YET MEASURED (LIVE ACOUSTIC TEST REQUIRED)
          </div>
        </div>
      </div>

      {/* Test Runs Table */}
      <div className="bg-white border border-app-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-app-border">
          <Database className="w-4 h-4 text-text-secondary" />
          <h3 className="text-xs font-mono font-extrabold uppercase text-text-primary tracking-wider">
            PERSISTENT TEST RUN EVIDENCE LOG (SQLITE)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-app-border text-text-muted text-[11px] bg-slate-50/80">
                <th className="py-3 px-4 rounded-l-lg">TEST ID</th>
                <th className="py-3 px-4">TOOL DELAY</th>
                <th className="py-3 px-4">EPOCH TRANSITION</th>
                <th className="py-3 px-4">STALE REJECTED</th>
                <th className="py-3 px-4">PARTIAL BLOCKED</th>
                <th className="py-3 px-4">EXECUTION TIME</th>
                <th className="py-3 px-4 rounded-r-lg">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border text-text-secondary">
              {!evidenceData?.test_runs || evidenceData.test_runs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-text-muted font-sans font-medium">
                    No test runs logged. Execute tests via Interruption Lab or test scripts.
                  </td>
                </tr>
              ) : (
                evidenceData.test_runs.map((t) => (
                  <tr key={t.test_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 text-aviation-blue font-bold">{t.test_id}</td>
                    <td className="py-3 px-4">{t.tool_delay_ms} ms</td>
                    <td className="py-3 px-4 font-bold text-text-primary">{t.initial_epoch} ➔ {t.interrupted_epoch}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">
                      {t.stale_tool_result_rejected ? 'PASS' : 'FAIL'}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">
                      {t.partial_commit_prevented ? 'PASS' : 'FAIL'}
                    </td>
                    <td className="py-3 px-4">{t.execution_time_ms} ms</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
