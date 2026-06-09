import { useState } from "react";
import { ScriptSketch } from "../types";
import { Sparkles, Save, Info, AlertOctagon, Film, Clapperboard, Layers, HeartCrack, HelpCircle } from "lucide-react";

interface ScriptOutlineProps {
  onSave: (type: "title" | "keyword_list" | "description" | "script" | "audit", title: string, content: string, tags?: string[]) => void;
  savedItemKeys: string[];
}

export default function ScriptOutline({ onSave, savedItemKeys }: ScriptOutlineProps) {
  const [topic, setTopic] = useState("");
  const [outlineType, setOutlineType] = useState("Short/Viral Hook");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sketch, setSketch] = useState<ScriptSketch | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo/script-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          outlineType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to formulate outline scripts sketch.");
      }

      const data: ScriptSketch = await response.json();
      setSketch(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to contact script generator server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="script-outline-view">
      {/* HEADER */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-purple-600/5 rounded-full blur-3xl" />
        <div className="max-w-xl">
          <h2 className="font-sans text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Film className="h-5 w-5 text-red-500" /> AI Script Hook & Outline Sketcher
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            Construct high-engagement scripting sketches. Map out precise 5-second attention anchors, body chapters, and click-through optimizations.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* CONFIG COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-lg">
            <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Configure Script Structure</h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-sans">Video Topic / Core Question *</label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. why javascript is hated but used everywhere, what is the best mechanical switch sound..."
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 p-2.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none"
                id="script-topic-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 font-sans">Video Target Format</label>
              <select
                value={outlineType}
                onChange={(e) => setOutlineType(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white focus:border-red-500 focus:outline-none"
                id="script-format-select"
              >
                <option>Short/Viral Hook (TikTok / YouTube Shorts)</option>
                <option>Medium / Informative (8-10 mins vlog)</option>
                <option>Long Documentary or Deep Dive (15-20 mins)</option>
                <option>Step-by-step Tutorial Outline</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-sm font-semibold text-white hover:from-red-500 hover:to-rose-500 transition shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              id="script-gen-btn"
            >
              <Clapperboard className="h-4.5 w-4.5" />
              {loading ? "Sketching Script..." : "Formulate Script Map"}
            </button>
          </div>
        </div>

        {/* DETAILS COLUMN */}
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
              <p className="text-sm font-medium text-zinc-400">Drafting audience retention curves and timeline visual directors notes...</p>
            </div>
          ) : sketch ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-sans text-xs font-bold text-zinc-400 uppercase tracking-wider">Generated Script Outline Blueprint</h3>
                <button
                  onClick={() => {
                    const serSections = sketch.sections
                      .map((s) => `[${s.timeframe} - ${s.title}]:\nObjective: ${s.scriptObjective}\nVisual Direction: ${s.visualDirectorNotes}`)
                      .join("\n\n");
                    const completeOutline = `HOOK:\n${sketch.hookIdea}\n\nINTRODUCTION TIP:\n${sketch.introEngagementTip}\n\nSECTIONS:\n${serSections}\n\nOUTRO ENGAGEMENT:\n${sketch.outroEngagement}`;
                    onSave("script", sketch.outlineTitle, completeOutline, [outlineType]);
                  }}
                  disabled={savedItemKeys.includes(sketch.outlineTitle)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition px-3 py-1.5 text-xs text-zinc-300 font-semibold cursor-pointer disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savedItemKeys.includes(sketch.outlineTitle) ? "Saved to Library" : "Save Full Script"}
                </button>
              </div>

              {/* Layout Content */}
              <div className="space-y-4">
                {/* 1. Critical Hook Box */}
                <div className="rounded-xl border border-red-500/20 bg-gradient-to-r from-red-600/10 via-rose-600/5 to-zinc-950 p-5 shadow-sm">
                  <span className="inline-flex rounded-full bg-red-600/30 px-2 py-0.5 text-[9px] font-bold text-red-400 uppercase tracking-wider mb-2">
                    Critical First 5 Secs Attention Anchor
                  </span>
                  <h4 className="text-sm font-black text-white">{sketch.outlineTitle}</h4>
                  <p className="text-sm font-extrabold italic text-zinc-200 mt-2 leading-relaxed border-l-2 border-red-500 pl-3">
                    "{sketch.hookIdea}"
                  </p>
                  <div className="text-[11px] text-zinc-400 mt-3 pl-3.5 border-l border-zinc-800">
                    <span className="font-semibold text-zinc-300">Retention Catalyst Recommendation:</span> {sketch.introEngagementTip}
                  </div>
                </div>

                {/* Segment timelines */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide flex items-center gap-1">
                    <Layers className="h-3.5 w-3.5 text-zinc-400" /> Chronological Timeline Blocks
                  </h4>

                  <div className="space-y-2.5">
                    {sketch.sections.map((sect, index) => (
                      <div key={index} className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-2 relative overflow-hidden">
                        <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-amber-500 border border-zinc-800 absolute right-3 top-3">
                          {sect.timeframe}
                        </span>
                        <div className="max-w-[80%]">
                          <h5 className="text-xs font-bold text-white uppercase tracking-wide">
                            {index + 1}. {sect.title}
                          </h5>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{sect.scriptObjective}</p>
                        <div className="bg-zinc-900/60 rounded-lg p-2.5 border border-zinc-900/40 mt-1">
                          <p className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">Visual/Acoustic Directors notes:</p>
                          <p className="text-xs text-zinc-400 italic mt-0.5 leading-relaxed">{sect.visualDirectorNotes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* End screen click-rate optimization outline */}
                <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 shadow-sm">
                  <span className="inline-flex rounded bg-zinc-900 border border-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                    End Screen Retention Catalyst (Outro)
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">"{sketch.outroEngagement}"</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-zinc-850 bg-zinc-950/20 p-12 text-center text-zinc-500">
              <Film className="h-8 w-8 mx-auto text-zinc-600 mb-2.5" />
              <p className="text-sm">Submit your video concept query on the left to map chapters outlines.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
