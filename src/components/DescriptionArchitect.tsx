import { useState, useEffect } from "react";
import { GeneratedDescription } from "../types";
import { FileText, Copy, Check, Save, Info, RefreshCw } from "lucide-react";

interface DescriptionArchitectProps {
  onSave: (type: "title" | "keyword_list" | "description" | "script" | "audit", title: string, content: string, tags?: string[]) => void;
  savedItemKeys: string[];
}

export default function DescriptionArchitect({ onSave, savedItemKeys }: DescriptionArchitectProps) {
  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [cta, setCta] = useState("Subscribe and turn on post notifications!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [descriptionBody, setDescriptionBody] = useState("");
  const [tips, setTips] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo/description-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          primaryKeywords: keywords,
          callToAction: cta,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to form optimized description templates.");
      }

      const data: GeneratedDescription = await response.json();
      setDescriptionBody(data.descriptionBody);
      setTips(data.tips || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact generators server.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(descriptionBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="description-architect-view">
      {/* HEADER */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="max-w-xl">
          <h2 className="font-sans text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <FileText className="h-5 w-5 text-red-500" /> SEO Description Box Architect
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            Formulate premium outline description templates with timelines, subscription instructions, disclaimer texts and targeted call-to-actions.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* CONFIG COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-lg">
            <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Configure Description Box</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Video Title Baseline *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. standard vs ortholinear mechanical keyboards"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                id="desc-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Target SEO Keywords</label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="mechanical keyboards, custom sound test, ergonomic keyboard typing"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                id="desc-keywords-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Primary Video Call-To-Action (CTA)</label>
              <input
                type="text"
                value={cta}
                onChange={(e) => setCta(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                id="desc-cta-input"
              />
              <span className="text-[10px] text-zinc-500 block mt-1 leading-snug">
                e.g. Subscribe for ergonomics and tech hardware vlogs, enroll inside our coding academy...
              </span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !title.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-semibold text-white hover:from-red-500 hover:to-rose-500 transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              id="desc-gen-btn"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Constructing Template..." : "Architect Description Box"}
            </button>
          </div>

          {/* Quick tips list */}
          {tips.length > 0 && (
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 shadow-sm space-y-2.5">
              <h5 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-zinc-400" /> Chapter Best Practices
              </h5>
              <div className="space-y-1.5">
                {tips.map((t, idx) => (
                  <p key={idx} className="text-xs text-zinc-400 leading-relaxed pl-3.5 border-l border-zinc-850">
                    {t}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* WORK BENCH TEXTBOX */}
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
              <p className="text-sm font-medium text-zinc-400">Embedding target metadata and formatting chapters timelines...</p>
            </div>
          ) : descriptionBody ? (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Interactive Workbench Box</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition px-3 py-1.5 text-xs text-zinc-300"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy Template"}
                  </button>
                  <button
                    onClick={() => {
                      onSave("description", `Description Box: ${title}`, descriptionBody, [cta]);
                    }}
                    disabled={savedItemKeys.includes(`Description Box: ${title}`)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {savedItemKeys.includes(`Description Box: ${title}`) ? "Saved" : "Save Draft"}
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl p-4">
                <textarea
                  value={descriptionBody}
                  onChange={(e) => setDescriptionBody(e.target.value)}
                  className="w-full rounded-xl border-0 bg-transparent p-1 font-mono text-[11px] sm:text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-0 leading-relaxed min-h-[380px]"
                />
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-850 bg-zinc-950/20 p-12 text-center text-zinc-500">
              <FileText className="h-8 w-8 mx-auto text-zinc-600 mb-2.5" />
              <p className="text-sm">Submit baseline title inputs on the left to structure your boilerplate templates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
