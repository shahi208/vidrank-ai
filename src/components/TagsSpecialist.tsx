import { useState } from "react";
import { GeneratedTags } from "../types";
import { Tag, Copy, Check, Save, Zap, AlertCircle, HelpCircle } from "lucide-react";

interface TagsSpecialistProps {
  onSave: (type: "title" | "keyword_list" | "description" | "script" | "audit", title: string, content: string, tags?: string[]) => void;
  savedItemKeys: string[];
}

export default function TagsSpecialist({ onSave, savedItemKeys }: TagsSpecialistProps) {
  const [title, setTitle] = useState("");
  const [topicKeywords, setTopicKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<GeneratedTags | null>(null);

  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo/tags-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          topicKeywords,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to formulate specialized tags checklist.");
      }

      const data: GeneratedTags = await response.json();
      setMetadata(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact seo server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, groupKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedGroup(groupKey);
    setTimeout(() => setCopiedGroup(null), 2000);
  };

  const getCombinedTags = () => {
    if (!metadata) return "";
    const all = [...metadata.tags.primary, ...metadata.tags.secondary, ...metadata.tags.broad];
    return all.join(", ");
  };

  return (
    <div className="space-y-6" id="tags-specialist-view">
      {/* HEADER */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-rose-600/5 rounded-full blur-3xl" />
        <div className="max-w-xl">
          <h2 className="font-sans text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Tag className="h-5 w-5 text-red-500" /> AI Video Tags & Hashtags Specialist
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            Generate high-intent search tags categorized into Primary, Secondary, and Broad groupings to feed the indexing algorithms accurately.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-lg">
            <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Describe Video Concept</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-sans">Target Video Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 10 Mistakes beginner programmer makes"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                id="tags-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Niche Keywords / Brands to Include</label>
              <textarea
                rows={3}
                value={topicKeywords}
                onChange={(e) => setTopicKeywords(e.target.value)}
                placeholder="coding, programming errors, javascript, python, web development"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 p-2.5 text-sm text-white focus:border-red-500 focus:outline-none"
                id="tags-keywords-input"
              />
              <span className="text-[10px] text-zinc-500 mt-1.5 block leading-relaxed">
                Adding niche words maps tags closer to your exact target search engine guidelines.
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !title.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-semibold text-white hover:from-red-500 hover:to-rose-500 transition shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              id="tags-gen-btn"
            >
              <Tag className="h-4 w-4" />
              {loading ? "Sorting Tag Hierarchies..." : "Formulate Optimized Tags"}
            </button>
          </div>
        </div>

        {/* OUTPUT COLUMN */}
        <div className="lg:col-span-7">
          {error && (
            <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400 flex gap-1.5">
              <AlertCircle className="h-4.5 w-4.5 text-red-500 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-24 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-red-500" />
              <p className="text-sm font-semibold text-zinc-400">Consulting YouTube search patterns and tag mappings...</p>
            </div>
          ) : metadata ? (
            <div className="space-y-5">
              {/* Algorithmic description rationale */}
              <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4 flex gap-3">
                <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 animate-ping shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-red-400 uppercase tracking-wide">SEO Recommendation</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">{metadata.optimizationSummary}</p>
                </div>
              </div>

              {/* Combined Tag strings (for direct copy into YT Creator studio dashboard) */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4.5 shadow-md">
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-white">Combined Tag Box (500 Chars Limit)</h4>
                    <p className="text-[10px] text-zinc-500">Copy and paste straight into YouTube Studio Tag field</p>
                  </div>
                  <button
                    onClick={() => handleCopyText(getCombinedTags(), "combined")}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition px-2.5 py-1 text-xs text-zinc-300"
                  >
                    {copiedGroup === "combined" ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy All
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={2}
                  value={getCombinedTags()}
                  className="w-full rounded-md border border-zinc-800 bg-zinc-900/40 p-2 font-mono text-[11px] text-zinc-400 select-all"
                />
              </div>

              {/* High-Impact Hashtags section */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4.5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" /> High-Impact Hashtags
                  </h4>
                  <button
                    onClick={() => handleCopyText(metadata.hashtags.join(" "), "hashtags")}
                    className="inline-flex items-center gap-1 rounded bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 transition"
                  >
                    {copiedGroup === "hashtags" ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    Copy Hashtags
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {metadata.hashtags.map((h, i) => (
                    <span key={i} className="inline-flex rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs font-semibold text-red-400">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Categorized breakdown groups */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Semantic Tag Distribution</h3>
                  <button
                    onClick={() => {
                      const allTags = [...metadata.tags.primary, ...metadata.tags.secondary, ...metadata.tags.broad];
                      onSave("keyword_list", `Tags Checklist: ${title}`, allTags.join(", "), allTags);
                    }}
                    disabled={savedItemKeys.includes(`Tags Checklist: ${title}`)}
                    className="inline-flex items-center gap-1 rounded bg-red-600 hover:bg-rose-600 px-2.5 py-1 text-[11px] text-white font-semibold transition disabled:opacity-50"
                  >
                    <Save className="h-3 w-3" />
                    {savedItemKeys.includes(`Tags Checklist: ${title}`) ? "Saved to Library" : "Save Tags List"}
                  </button>
                </div>

                <div className="grid gap-3.5 sm:grid-cols-3">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
                    <h5 className="text-[11px] font-bold text-white uppercase tracking-wider mb-2.5">1. Primary Focus Tags</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {metadata.tags.primary.map((p, i) => (
                        <span key={i} className="rounded bg-zinc-90 w-full px-2 py-1 text-[11px] font-medium text-zinc-300 border border-zinc-850">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
                    <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2.5">2. Secondary Modi Tags</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {metadata.tags.secondary.map((s, i) => (
                        <span key={i} className="rounded bg-zinc-90 w-full px-2 py-1 text-[11px] font-medium text-zinc-400 border border-zinc-850">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 shadow-sm">
                    <h5 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">3. Broad Category Tags</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {metadata.tags.broad.map((b, i) => (
                        <span key={i} className="rounded bg-zinc-90 w-full px-2 py-1 text-[11px] font-medium text-zinc-500 border border-zinc-850">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-850 bg-zinc-950/20 p-12 text-center text-zinc-500">
              <Tag className="h-8 w-8 mx-auto text-zinc-600 mb-2.5" />
              <p className="text-sm">Describe your video on the left to extract algorithm-mapped index keywords.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
