import { useState } from "react";
import { GeneratedTitle } from "../types";
import { Sparkles, Save, Copy, Check, Info, HelpCircle, Eye, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TitleGeneratorProps {
  onSave: (type: "title" | "keyword_list" | "description" | "script" | "audit", title: string, content: string, tags?: string[]) => void;
  savedItemKeys: string[];
}

export default function TitleGenerator({ onSave, savedItemKeys }: TitleGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [primaryKeyword, setPrimaryKeyword] = useState("");
  const [audience, setAudience] = useState("General Audience");
  const [tone, setTone] = useState("Curiosity & Intrigue");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titles, setTitles] = useState<GeneratedTitle[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [simulatedTitle, setSimulatedTitle] = useState("");
  const [simulatedViews, setSimulatedViews] = useState("1.4M views");
  const [simulatedDays, setSimulatedDays] = useState("3 days ago");

  const handleSubmit = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo/title-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          primaryKeyword,
          audience,
          tone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate titles from analytical server.");
      }

      const data = await response.json();
      setTitles(data.titles || []);

      if (data.titles && data.titles.length > 0) {
        setSimulatedTitle(data.titles[0].titleName);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact generator service.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getUrgencyBadge = (rating: string) => {
    switch (rating.toLowerCase()) {
      case "high":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  const getCtrGrade = (score: number) => {
    if (score >= 88) return { label: "Exceptional (A+)", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" };
    if (score >= 76) return { label: "Excellent (A)", color: "text-emerald-400/90 border-emerald-500/20 bg-emerald-500/5" };
    if (score >= 60) return { label: "Above Average (B)", color: "text-amber-400 border-amber-500/20 bg-amber-500/5" };
    return { label: "Weak (C)", color: "text-zinc-400 border-zinc-700 bg-zinc-800/20" };
  };

  return (
    <div className="space-y-6" id="title-generator-view">
      {/* HEADER SECTION */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-rose-600/5 rounded-full blur-3xl" />
        <div className="max-w-xl">
          <h2 className="font-sans text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-red-500" /> High-CTR Viral Title Forge
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            Generate high click-through rate title outlines utilizing psychological hooks to instantly improve impressions conversion rates.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* INPUT FORM GRID LINE */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-lg">
            <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Configure Forge Parameters</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">What is your video about? *</label>
              <textarea
                rows={2}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. standard vs ortholinear mechanical keyboards, why i switched to typescript..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 p-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                id="title-topic-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Focus Keyword (Recommended)</label>
              <input
                type="text"
                value={primaryKeyword}
                onChange={(e) => setPrimaryKeyword(e.target.value)}
                placeholder="e.g. keyboard ergonomics, typescript switch"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                id="title-keyword-input"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Target Audience</label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                  id="title-audience-select"
                >
                  <option>General Audience</option>
                  <option>Beginner level</option>
                  <option>Experienced Pros</option>
                  <option>Tech enthusiasts</option>
                  <option>Gamers</option>
                  <option>Students / Career</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Psychological Hook Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                  id="title-tone-select"
                >
                  <option>Curiosity & Intrigue</option>
                  <option>Extreme comparison</option>
                  <option>Fear of Missing Out (FOMO)</option>
                  <option>Value & Tutorial</option>
                  <option>Contrarian & Hot Take</option>
                  <option>Numeric Lists</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !topic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-semibold text-white hover:from-red-500 hover:to-rose-500 active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              id="title-gen-btn"
            >
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
              {loading ? "Forging and Score Rating..." : "Forge AI Titles"}
            </button>
          </div>

          {/* SIMULATOR PREVIEW BLOCK */}
          {simulatedTitle && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
              <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-blue-400" /> YouTube Visual Simulator
              </h3>

              <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                {/* Simulated frame preview image based on placeholder patterns */}
                <div className="relative aspect-video bg-zinc-950 flex items-center justify-center select-none border-b border-zinc-800">
                  <div className="absolute inset-0 bg-gradient-to-tr from-rose-950/20 via-purple-950/25 to-zinc-900/10" />
                  <div className="text-center p-4 z-10 space-y-1">
                    <span className="inline-block rounded-md bg-red-600/90 text-[10px] font-bold text-white px-2 py-0.5 uppercase tracking-wide">
                      Optimized Hook
                    </span>
                    <h4 className="text-xs font-semibold text-zinc-300 max-w-[200px] truncate">{primaryKeyword || "VIRAL THUMBNAIL"}</h4>
                  </div>
                  {/* Timestamp duration label */}
                  <span className="absolute bottom-2 right-2 rounded bg-zinc-950/90 px-1.5 py-0.5 text-[10px] font-bold text-white font-mono">
                    10:48
                  </span>
                </div>

                {/* Info block */}
                <div className="p-3.5 flex gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-800 flex items-center justify-center font-bold text-[10px] border border-zinc-700 text-zinc-400 uppercase">
                    YT
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-zinc-100 line-clamp-2 leading-snug">{simulatedTitle}</h4>
                    <div className="flex flex-col text-[11px] text-zinc-400 font-medium">
                      <span>Your Creator Network</span>
                      <div className="flex items-center gap-1 text-[10px]">
                        <span>{simulatedViews}</span>
                        <span>•</span>
                        <span>{simulatedDays}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RESULTS LINE */}
        <div className="lg:col-span-7">
          {error && (
            <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400 flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-red-500" />
              <p className="text-sm font-semibold text-zinc-400">Forging clickable titles with psychological hooks...</p>
            </div>
          ) : titles ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-sm font-bold text-white uppercase tracking-wider">Suggested Titles</h3>
                <span className="text-xs text-zinc-500">Sorted by CTR trigger weight</span>
              </div>

              <div className="space-y-3">
                {titles.map((t, i) => {
                  const grade = getCtrGrade(t.ctrScore);
                  return (
                    <div
                      key={i}
                      onClick={() => setSimulatedTitle(t.titleName)}
                      className={`group rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-700 cursor-pointer transition relative overflow-hidden ${
                        simulatedTitle === t.titleName ? "ring-1 ring-red-500/40 border-zinc-700" : ""
                      }`}
                    >
                      {/* background hover neon glow */}
                      <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-red-600 to-rose-500 opacity-0 group-hover:opacity-100 transition-all" />

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center rounded border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 text-[10px] font-sans text-zinc-400">
                              {t.hookType}
                            </span>
                            <span className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-mono ${getUrgencyBadge(t.urgencyRating)}`}>
                              {t.urgencyRating} Urgency
                            </span>
                          </div>
                          <h4 className="text-sm font-extrabold text-zinc-100 leading-snug group-hover:text-white transition">
                            {t.titleName}
                          </h4>
                          <p className="text-xs text-zinc-400">{t.whyItWorks}</p>
                        </div>

                        {/* CTR SCORE INDICATOR CHART */}
                        <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-2 bg-zinc-900/50 rounded-lg p-2 border border-zinc-850 min-w-[124px]">
                          <span className="text-[10px] text-zinc-400">CTR Probability</span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-mono text-xl font-black text-emerald-400">{t.ctrScore}%</span>
                          </div>
                          <span className={`text-[10px] font-bold rounded border px-1 py-0.5 truncate ${grade.color}`}>
                            {grade.label}
                          </span>
                        </div>
                      </div>

                      {/* ACTIONS SUB LINE */}
                      <div className="mt-3.5 pt-3 border-t border-zinc-900/80 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition">
                          Click to display in YouTube mockup preview above
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(t.titleName, i);
                            }}
                            className="inline-flex rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 p-1.5 text-zinc-400 hover:text-white transition"
                            title="Copy Title"
                          >
                            {copiedIndex === i ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSave("title", t.titleName, t.whyItWorks, [t.hookType, t.urgencyRating]);
                            }}
                            disabled={savedItemKeys.includes(t.titleName)}
                            className="inline-flex items-center gap-1 rounded bg-red-600/10 border border-red-500/20 hover:bg-red-600/20 px-2.5 py-1 text-[11px] font-bold text-red-400 hover:text-white transition disabled:opacity-50"
                          >
                            <Save className="h-3 w-3" />
                            {savedItemKeys.includes(t.titleName) ? "Saved" : "Save Title"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-850 bg-zinc-950/20 p-12 text-center text-zinc-500">
              <Sparkles className="h-8 w-8 mx-auto text-zinc-600 mb-2.5" />
              <p className="text-sm">Configure parameters on the left and tap "Forge AI Titles" to draft dynamic headlines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
