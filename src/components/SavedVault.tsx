import { useState } from "react";
import { SavedItemDoc } from "../types";
import { Archive, Copy, Check, Trash2, Calendar, HelpCircle, Shield, ArrowRight, CornerDownRight } from "lucide-react";

interface SavedVaultProps {
  items: SavedItemDoc[];
  onDelete: (id: string) => void;
  userSignedIn: boolean;
}

export default function SavedVault({ items, onDelete, userSignedIn }: SavedVaultProps) {
  const [filterType, setFilterType] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "title":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "keyword_list":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "description":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "script":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  const capitalize = (str: string) => {
    if (!str) return "";
    return str.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-6" id="saved-vault-view">
      {/* HEADER */}
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-red-600/5 rounded-full blur-3xl" />
        <div className="max-w-xl">
          <h2 className="font-sans text-xl font-bold text-white sm:text-2xl flex items-center gap-2">
            <Archive className="h-5 w-5 text-red-500" /> Saved Asset Vault
          </h2>
          <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
            Your personal library of drafted tags, keywords, titles, and descriptions.
            {!userSignedIn && " (Stored locally in your browser. Sign in with Google to synchronize across devices on our Firebase clouds!)"}
          </p>
        </div>
      </div>

      {/* FILTER CHEVRONS */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "title", "keyword_list", "description", "script", "audit"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
              filterType === t
                ? "bg-red-600 text-white"
                : "border border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
            }`}
          >
            {t === "keyword_list" ? "Keywords" : t}
          </button>
        ))}
      </div>

      {/* LIST OR BENTO GRID */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 p-16 text-center text-zinc-500">
          <Archive className="h-10 w-10 text-zinc-700 mb-3" />
          <p className="text-sm font-semibold text-zinc-400">Your saved shelf is empty.</p>
          <p className="mt-1 text-xs text-zinc-500 max-w-sm">
            Generate and save some titles, keywords list, descriptions, script outlines or video checklists to synchronize drafts here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between hover:border-zinc-750 transition shadow-md">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <span className={`inline-flex items-center rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(item.type)}`}>
                    {capitalize(item.type)}
                  </span>
                  <p className="font-mono text-[9px] text-zinc-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>

                {/* Title */}
                <h4 className="font-sans text-sm font-extrabold text-white leading-snug line-clamp-2">
                  {item.titleName}
                </h4>

                {/* Body Content */}
                <div className="rounded bg-zinc-900/45 p-3 border border-zinc-900/60 font-mono text-[11px] text-zinc-400 select-all whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                  {item.content}
                </div>

                {/* Tags if any */}
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1.5">
                    {item.tags.slice(0, 10).map((tg, idx) => (
                      <span key={idx} className="rounded bg-zinc-900 border border-zinc-850 px-1.5 py-0.5 text-[9px] text-zinc-400 font-medium">
                        {tg}
                      </span>
                    ))}
                    {item.tags.length > 10 && (
                      <span className="text-[9px] text-zinc-500 font-semibold self-center">+{item.tags.length - 10} more</span>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-3.5 border-t border-zinc-90 w-full flex items-center justify-between gap-3">
                <button
                  onClick={() => handleCopy(item.id, item.content)}
                  className="inline-flex items-center gap-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-805 p-1.5 text-xs text-zinc-300 transition"
                  title="Copy Full Draft"
                >
                  {copiedId === item.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedId === item.id ? "Copied code" : "Copy Draft"}
                </button>

                <button
                  onClick={() => onDelete(item.id)}
                  className="inline-flex rounded p-1.5 text-zinc-550 hover:bg-red-950/20 hover:text-red-400 transition"
                  title="Delete Draft"
                  id={`del-btn-${item.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
