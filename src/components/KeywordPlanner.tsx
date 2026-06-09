import { useState } from "react";
import { KeywordAnalysis, RelatedKeyword } from "../types";
import { Search, Info, TrendingUp, TrendingDown, Minus, Save, Copy, Check, BarChart3, HelpCircle, Award, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface KeywordPlannerProps {
  onSave: (type: "title" | "keyword_list" | "description" | "script" | "audit", title: string, content: string, tags?: string[]) => void;
  savedItemKeys: string[];
}

export default function KeywordPlanner({ onSave, savedItemKeys }: KeywordPlannerProps) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<KeywordAnalysis | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Search History local states
  const [history, setHistory] = useState<Array<{ keyword: string; score: number }>>([
    { keyword: "how to edit youtube video", score: 71 },
    { keyword: "react native tutorial 2026", score: 58 },
    { keyword: "passive income stream ideas", score: 45 },
  ]);

  const handleSearch = async (termToSearch?: string) => {
    const activeTerm = termToSearch || keyword;
    if (!activeTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/seo/keyword-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: activeTerm }),
      });

      if (!response.ok) {
        throw new Error("Failed to load keyword analysis from server.");
      }

      const data: KeywordAnalysis = await response.json();
      setAnalysis(data);

      // Add to search history if not exists
      if (!history.some((h) => h.keyword.toLowerCase() === data.keyword.toLowerCase())) {
        setHistory((prev) => [{ keyword: data.keyword, score: data.overallScore }, ...prev.slice(0, 5)]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during research.");
    } finally {
      setLoading(false);
    }
  };

  const copyKeywordToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllKeywords = () => {
    if (!analysis) return;
    const all = [analysis.keyword, ...analysis.related.map((r) => r.keyword)].join(", ");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 50) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-red-400 bg-red-500/10 border-red-500/20";
  };

  const getCompetitionColor = (score: number) => {
    // For competition, lower is better (green)
    if (score <= 35) return "text-emerald-400进度 bg-emerald-500/15";
    if (score <= 65) return "text-amber-400 bg-amber-500/15";
    return "text-red-400 bg-red-500/15";
  };

  // Convert related keywords for the dual-axis chart
  const chartData = analysis
    ? [
        { name: analysis.keyword, Volume: analysis.searchVolume, Competition: analysis.competition },
        ...analysis.related.map((r) => ({
          name: r.keyword.slice(0, 15) + (r.keyword.length > 15 ? "..." : ""),
          Volume: r.searchVolume,
          Competition: r.competition,
        })),
      ]
    : [];

  return (
    <div className="space-y-6" id="keyword-planner-view">
      {/* Search Header */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-xl">
          <h2 className="font-sans text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-red-500" /> YouTube Keyword Planner
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            Uncover search volume, traffic potential, and competition levels. Target high-opportunity search terms to skyrocket your YouTube visibility.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="absolute top-3.5 left-3.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="e.g. build standard mechanical keyboard, react js tutorial..."
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/60 pb-3 pl-10 pr-4 pt-3 text-sm text-white placeholder-zinc-500 focus:border-red-500/70 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                id="keyword-search-input"
              />
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !keyword.trim()}
              className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-500 transition active:scale-95 disabled:opacity-50"
              id="keyword-search-btn"
            >
              {loading ? "Searching..." : "Analyze keyword"}
            </button>
          </div>

          {/* Quick history badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-500">History:</span>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setKeyword(h.keyword);
                  handleSearch(h.keyword);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900/50 px-2.5 py-0.5 text-xs text-zinc-300 hover:border-zinc-700 hover:text-white transition"
              >
                {h.keyword}
                <span className="text-[10px] text-red-400 font-mono">({h.score})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-900/30 bg-red-950/20 p-4 text-sm text-red-400 flex gap-2">
          <Info className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center p-16 space-y-4 rounded-xl border border-zinc-800 bg-zinc-950">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-red-500" />
          <p className="text-sm font-medium text-zinc-400">Verifying competitive indices and volume parameters...</p>
        </div>
      )}

      {/* SEARCH ANALYSIS RESULT */}
      {analysis && !loading && (
        <div className="space-y-6">
          {/* Main index block */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* volume score card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Search Volume</span>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold text-white">{analysis.searchVolume}</span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
              <div className="mt-3.5 h-1.5 w-full rounded-full bg-zinc-800">
                <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${analysis.searchVolume}%` }} />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {analysis.searchVolume >= 70 ? "Excellent traffic density." : analysis.searchVolume >= 40 ? "Stable search volumes." : "Niche search density."}
              </p>
            </div>

            {/* competition card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Competition</span>
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-extrabold text-white">{analysis.competition}</span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
              <div className="mt-3.5 h-1.5 w-full rounded-full bg-zinc-800">
                <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${analysis.competition}%` }} />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {analysis.competition >= 70 ? "Highly competitive field." : analysis.competition >= 40 ? "Moderate rival channels." : "Low competition target!"}
              </p>
            </div>

            {/* overall SEO rating */}
            <div className={`rounded-xl border p-5 relative overflow-hidden shadow-xl ${getScoreColor(analysis.overallScore)}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold opacity-80">Overall SEO Score</span>
                <Award className="h-5 w-5" />
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-black">{analysis.overallScore}</span>
                <span className="text-xs opacity-70">/ 100</span>
              </div>
              <div className="mt-3.5 h-1.5 w-full rounded-full bg-zinc-800">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-400"
                  style={{ width: `${analysis.overallScore}%` }}
                />
              </div>
              <p className="mt-2 text-xs opacity-90">
                {analysis.overallScore >= 70 ? "Superb opportunity. Good Volume vs Competition." : analysis.overallScore >= 50 ? "Solid candidate for SEO optimization." : "Difficult to establish traction."}
              </p>
            </div>
          </div>

          {/* Strategy Tip Alert */}
          <div className="rounded-xl border border-red-500/10 bg-red-500/5 p-4.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-red-400 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 animate-pulse" /> Algorithmic Recommendation
            </h4>
            <p className="mt-1 text-sm text-zinc-300 leading-relaxed">{analysis.strategyTip}</p>
          </div>

          {/* Graphical recharts section */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-sans text-sm font-bold text-white">Visual Performance Map</h3>
                <p className="text-xs text-zinc-500">Comparing search volume vs relative organic competition difficulty</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Search Volume
                </span>
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-400" /> Competition
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "8px" }}
                    itemStyle={{ fontSize: "12px" }}
                    labelStyle={{ color: "#fff", fontWeight: "bold", fontSize: "12px" }}
                  />
                  <Bar dataKey="Volume" fill="#10b981" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-vol-${index}`} fill={index === 0 ? "#059669" : "#10b981"} />
                    ))}
                  </Bar>
                  <Bar dataKey="Competition" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-comp-${index}`} fill={index === 0 ? "#d97706" : "#f59e0b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Related keywords table */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-lg">
            <div className="border-b border-zinc-800 bg-zinc-900/40 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-sans text-sm font-bold text-white">Suggested Semantic Variations</h3>
                <p className="text-xs text-zinc-500">Related searches to incorporate inside title context and tag strings</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copyAllKeywords}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition px-3 py-1.5 text-xs text-zinc-300 hover:text-white"
                >
                  {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy All
                </button>
                <button
                  onClick={() => {
                    const tList = [analysis.keyword, ...analysis.related.map((r) => r.keyword)];
                    onSave("keyword_list", `Keywords: ${analysis.keyword}`, tList.join(", "), tList);
                  }}
                  disabled={savedItemKeys.includes(`Keywords: ${analysis.keyword}`)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/90 hover:bg-red-600 px-3 py-1.5 text-xs text-white transition disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {savedItemKeys.includes(`Keywords: ${analysis.keyword}`) ? "Saved to Vault" : "Save List"}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-300">
                <thead className="bg-zinc-900/20 text-xs text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="py-3.5 px-4 w-[40%]">Keyword Variation</th>
                    <th className="py-3.5 px-4">Search Volume</th>
                    <th className="py-3.5 px-4">Competition Check</th>
                    <th className="py-3.5 px-4">SEO Rating</th>
                    <th className="py-3.5 px-4">Trend</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {/* Primary analyzed keyword */}
                  <tr className="bg-zinc-900/35 hover:bg-zinc-900/50">
                    <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                      {analysis.keyword}
                      <span className="text-[10px] text-zinc-500 uppercase px-1 rounded border border-zinc-800">Root</span>
                    </td>
                    <td className="py-4 px-4 font-mono font-semibold">{analysis.searchVolume}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded bg-zinc-800 overflow-hidden">
                          <div className={`h-full rounded ${getCompetitionColor(analysis.competition)}`} style={{ width: `${analysis.competition}%` }} />
                        </div>
                        <span className="text-xs font-semibold">{analysis.competition}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${getScoreColor(analysis.overallScore)}`}>
                        {analysis.overallScore}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                        <TrendingUp className="h-3.5 w-3.5" /> High
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => copyKeywordToClipboard(analysis.keyword, 999)}
                        className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition"
                        title="Copy Keyword"
                      >
                        {copiedIndex === 999 ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </td>
                  </tr>

                  {/* Related keywords lists */}
                  {analysis.related.map((item, index) => (
                    <tr key={index} className="hover:bg-zinc-900/40 transition">
                      <td className="py-4 px-4 font-medium text-zinc-100">{item.keyword}</td>
                      <td className="py-4 px-4 font-mono">{item.searchVolume}</td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-12 rounded bg-zinc-800 overflow-hidden">
                            <div className="h-full bg-amber-500 rounded" style={{ width: `${item.competition}%` }} />
                          </div>
                          <span className="text-xs">{item.competition}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getScoreColor(item.overallScore)}`}>
                          {item.overallScore}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {item.searchTrend === "up" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs">
                            <TrendingUp className="h-3.5 w-3.5" /> Up
                          </span>
                        ) : item.searchTrend === "down" ? (
                          <span className="inline-flex items-center gap-1 text-red-500 text-xs">
                            <TrendingDown className="h-3.5 w-3.5" /> Down
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-500 text-xs">
                            <Minus className="h-3.5 w-3.5" /> Stable
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => copyKeywordToClipboard(item.keyword, index)}
                          className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white transition"
                          title="Copy Keyword"
                        >
                          {copiedIndex === index ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
