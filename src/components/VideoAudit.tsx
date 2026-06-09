import { useState } from "react";
import { AuditReport } from "../types";
import { ShieldCheck, ArrowRight, Save, HelpCircle, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface VideoAuditProps {
  onSave: (type: "title" | "keyword_list" | "description" | "script" | "audit", title: string, content: string, tags?: string[]) => void;
  savedItemKeys: string[];
}

export default function VideoAudit({ onSave, savedItemKeys }: VideoAuditProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);

  const handleAudit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo/metadata-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tagsString: tags,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process audit report from server.");
      }

      const data: AuditReport = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during auditing.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
        return <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />;
      case "needs_improvement":
        return <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
      default:
        return <XCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "needs_improvement":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-red-500/10 text-red-400 border-red-500/20";
    }
  };

  const getScoreRatingText = (score: number) => {
    if (score >= 85) return { text: "Outstanding SEO! Algorithm ready.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };
    if (score >= 65) return { text: "Above average. Fix critical suggestions to boost rank.", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" };
    return { text: "Low visibility. Important keyword associations are missing.", color: "text-red-400 bg-red-500/10 border-red-500/20" };
  };

  return (
    <div className="space-y-6" id="video-audit-view">
      {/* HEADER */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="max-w-xl">
          <h2 className="font-sans text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-red-500" /> SEO Checklist & Metadata Auditor
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            Run an algorithmic audit on your video metadata drafts. Calculate optimization percentages, check search visibility, and fix red spots.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* INPUT COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-lg">
            <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Input Draft Metadata</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Proposed Video Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How to learn coding as a beginner in 2026 (Full Roadmap)"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                id="audit-title-input"
              />
              <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                <span>Keep titles between 50-70 characters.</span>
                <span className={title.length > 70 ? "text-amber-400" : ""}>{title.length}/100</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Proposed Video Description</label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Paste your video description draft here. Make sure to concentrate main search terms in the first 2 lines..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 p-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                id="audit-desc-input"
              />
              <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                <span>Include chapters outline and social templates.</span>
                <span>{description.length} chars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Video Tags & Keywords</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="coding roadmap, learn javascript, software engineer, tech guide"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                id="audit-tags-input"
              />
              <span className="text-[10px] text-zinc-500 block mt-1">Separate keywords using commas.</span>
            </div>

            <button
              onClick={handleAudit}
              disabled={loading || !title.trim()}
              className="w-full rounded-xl bg-red-600/95 hover:bg-red-600 py-3 text-sm font-semibold text-white shadow-md active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              id="audit-run-btn"
            >
              Analyze Metadata Setup
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* REVIEWS COLUMN */}
        <div className="lg:col-span-7">
          {error && (
            <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400 flex gap-1.5">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-red-500" />
              <p className="text-sm font-semibold text-zinc-400">Auditing description density, tag limits and semantic keywords...</p>
            </div>
          ) : report ? (
            <div className="space-y-6">
              {/* Scorecard Box */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Video SEO Health Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-extrabold text-white">{report.overallScore}</span>
                    <span className="text-sm text-zinc-500 font-semibold">/ 100</span>
                  </div>
                  <div className="mt-2 text-xs">
                    <span className={`inline-flex rounded border px-2.5 py-1 text-xs font-semibold ${getScoreRatingText(report.overallScore).color}`}>
                      {getScoreRatingText(report.overallScore).text}
                    </span>
                  </div>
                </div>

                {/* Score Dial Simulator using mini BarChart or Gauge rendering */}
                <div className="h-28 w-28 shrink-0 bg-zinc-900 border border-zinc-800 rounded-full flex flex-col items-center justify-center relative shadow-inner">
                  <div className="absolute inset-2 border border-zinc-800/40 rounded-full" />
                  <span className="text-[10px] text-zinc-500 tracking-wider font-semibold uppercase">Status</span>
                  <span className="text-sm font-extrabold text-white mt-0.5">
                    {report.overallScore >= 85 ? "Excellent" : report.overallScore >= 65 ? "Good" : "Critique"}
                  </span>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border-2 border-red-500 animate-ping opacity-10" />
                </div>
              </div>

              {/* Checklist details */}
              <div className="rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden shadow-md">
                <div className="border-b border-zinc-900 bg-zinc-90 w-full px-5 py-4.5">
                  <h3 className="font-sans text-sm font-bold text-white">Automated SEO Checklist</h3>
                  <p className="text-xs text-zinc-500">Fundamental criteria used by algorithms to index vlogs</p>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Perfect Title length (50-70 chars)</span>
                    {report.checklist.titleLengthOk ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Description density okay</span>
                    {report.checklist.descriptionLengthOk ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Includes core Call to Action (CTA)</span>
                    {report.checklist.hasCallToAction ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Includes social networks link lists</span>
                    {report.checklist.hasSocialLinks ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Keyword matching in Title</span>
                    {report.checklist.keywordInTitle ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Keyword matching in Description</span>
                    {report.checklist.keywordInDescription ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Rich tags mapped</span>
                    {report.checklist.tagsOptimized ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-zinc-900 bg-zinc-900/10 px-3.5 py-2.5">
                    <span className="text-xs text-zinc-300">Click triggers mapped</span>
                    {report.checklist.clickTriggerPresense ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-zinc-650" />}
                  </div>
                </div>
              </div>

              {/* Action items detailed listing */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">Actionable Optimization Suggestions</h3>
                  <button
                    onClick={() => {
                      const suggList = report.feedback.map((f) => `[${f.metric} - ${f.status}]: ${f.suggestion}`);
                      onSave("audit", `Audit: ${title}`, suggList.join("\n"), [report.overallScore.toString()]);
                    }}
                    disabled={savedItemKeys.includes(`Audit: ${title}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition px-3 py-1.5 text-xs text-zinc-300"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savedItemKeys.includes(`Audit: ${title}`) ? "Saved" : "Save Report"}
                  </button>
                </div>

                <div className="space-y-2.5">
                  {report.feedback.map((f, index) => (
                    <div key={index} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 flex gap-3">
                      <div className="mt-0.5 shrink-0">{getStatusIcon(f.status)}</div>
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-200">{f.metric}</h4>
                          <span className={`rounded px-1.5 py-0.5 text-[9px] font-sans font-medium uppercase border ${getStatusBadge(f.status)}`}>
                            {f.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed">{f.suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-850 bg-zinc-950/20 p-12 text-center text-zinc-500">
              <ShieldCheck className="h-8 w-8 mx-auto text-zinc-600 mb-2.5" />
              <p className="text-sm">Submit your video draft parameters on the left to analyze the metadata compatibility.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
