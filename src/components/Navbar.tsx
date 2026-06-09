import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut, User } from "firebase/auth";
import { auth } from "../firebase";
import { Youtube, LogIn, LogOut, ShieldAlert, Award, UserCheck, Flame, Zap } from "lucide-react";

interface NavbarProps {
  user: User | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  savedCount: number;
}

export default function Navbar({ user, loading, activeTab, setActiveTab, savedCount }: NavbarProps) {
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Auth Error:", error);
      setAuthError(error.message || "Failed to authenticate.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 sm:px-6 sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* LOGO */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-purple-600 shadow-md ring-1 ring-red-400/20">
              <Youtube className="h-5.5 w-5.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-bold tracking-tight text-white text-lg sm:text-xl">
                  VidRank<span className="text-red-500">.</span>ai
                </span>
                <span className="inline-flex items-center rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-medium text-red-400 ring-1 ring-red-500/20">
                  <Zap className="mr-0.5 h-2.5 w-2.5" /> PRO
                </span>
              </div>
              <p className="font-mono text-[9px] text-zinc-500 tracking-wider uppercase">YouTube SEO & Growth Engine</p>
            </div>
          </div>

          {/* Collapsed mobile actions */}
          <div className="flex items-center gap-2 sm:hidden">
            {user ? (
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || "User"}`}
                alt="Avatar"
                className="h-8 w-8 rounded-full border border-red-500/40"
              />
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition"
                id="mob-login-btn"
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab("keyword")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              activeTab === "keyword"
                ? "bg-zinc-800 text-red-400 shadow-inner"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
            id="tab-keyword"
          >
            Keywords
          </button>
          <button
            onClick={() => setActiveTab("title")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              activeTab === "title"
                ? "bg-zinc-800 text-red-400 shadow-inner"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
            id="tab-title"
          >
            Titles
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              activeTab === "audit"
                ? "bg-zinc-800 text-red-400 shadow-inner"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
            id="tab-audit"
          >
            Video Audit
          </button>
          <button
            onClick={() => setActiveTab("tags")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              activeTab === "tags"
                ? "bg-zinc-800 text-red-400 shadow-inner"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
            id="tab-tags"
          >
            Tags Specialist
          </button>
          <button
            onClick={() => setActiveTab("description")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              activeTab === "description"
                ? "bg-zinc-800 text-red-400 shadow-inner"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
            id="tab-description"
          >
            Descriptions
          </button>
          <button
            onClick={() => setActiveTab("script")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              activeTab === "script"
                ? "bg-zinc-800 text-red-400 shadow-inner"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
            id="tab-script"
          >
            Script Hook
          </button>
          <button
            onClick={() => setActiveTab("vault")}
            className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition duration-200 ${
              activeTab === "vault"
                ? "bg-zinc-850 text-red-400"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
            id="tab-vault"
          >
            Saved Vault
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-zinc-950 animate-pulse">
                {savedCount}
              </span>
            )}
          </button>
        </div>

        {/* AUTH CONTROLLER */}
        <div className="hidden sm:flex items-center gap-3">
          {authError && (
            <div className="flex items-center gap-1.5 rounded-lg bg-red-950/40 border border-red-900 px-3 py-1.5 text-xs text-red-400">
              <ShieldAlert className="h-3.5 w-3.5 truncate max-w-[200px]" />
              Authenticating failed
            </div>
          )}

          {loading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-zinc-900" />
          ) : user ? (
            <div className="flex items-center gap-3 bg-zinc-900 rounded-xl p-1.5 pl-3 border border-zinc-800">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-zinc-100">{user.displayName || "Creator"}</span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <UserCheck className="h-2.5 w-2.5 text-emerald-400" /> Connected
                </span>
              </div>
              <img
                src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || "User"}`}
                alt="User Profile"
                referrerPolicy="no-referrer"
                className="h-8 w-8 rounded-full border border-zinc-700"
              />
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition"
                title="Log Out"
                id="logout-btn"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg hover:from-red-500 hover:to-rose-500 ring-1 ring-red-400/20 active:scale-95 transition duration-150"
              id="login-btn"
            >
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
