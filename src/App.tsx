/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocFromServer } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { SavedItemDoc } from "./types";

import Navbar from "./components/Navbar";
import KeywordPlanner from "./components/KeywordPlanner";
import TitleGenerator from "./components/TitleGenerator";
import VideoAudit from "./components/VideoAudit";
import TagsSpecialist from "./components/TagsSpecialist";
import DescriptionArchitect from "./components/DescriptionArchitect";
import ScriptOutline from "./components/ScriptOutline";
import SavedVault from "./components/SavedVault";

import { AlertTriangle, Sparkles, Youtube, Zap, ShieldCheck, Flame, MessageSquare } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("keyword");
  const [savedItems, setSavedItems] = useState<SavedItemDoc[]>([]);

  // 1. Connection check as mandated by the Firebase skill guidelines
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        console.warn("Firestore connection check finished: ", error);
      }
    }
    testConnection();
  }, []);

  // 2. Authentication State Subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 3. Sync Database or Local Storage shelf
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // User is authenticated -> Sync Firestore saved items list
      const colPath = `users/${user.uid}/saved_items`;
      const colRef = collection(db, "users", user.uid, "saved_items");

      const unsubscribe = onSnapshot(
        colRef,
        (snapshot) => {
          const itemsList: SavedItemDoc[] = [];
          snapshot.forEach((doc) => {
            itemsList.push(doc.data() as SavedItemDoc);
          });
          // Sort chronologically by date
          itemsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setSavedItems(itemsList);
        },
        (error) => {
          // Mandatory diagnostics catch block
          handleFirestoreError(error, OperationType.LIST, colPath);
        }
      );

      return () => unsubscribe();
    } else {
      // Guest mode -> Fall back to local storage
      const local = localStorage.getItem("vidrank_saved_items");
      if (local) {
        try {
          setSavedItems(JSON.parse(local));
        } catch (e) {
          setSavedItems([]);
        }
      } else {
        setSavedItems([]);
      }
    }
  }, [user, authLoading]);

  // 4. Save and delete triggers
  const handleSaveItem = async (
    type: "title" | "keyword_list" | "description" | "script" | "audit",
    title: string,
    content: string,
    tags?: string[]
  ) => {
    const itemId = `item_${Date.now()}`;
    const payload: SavedItemDoc = {
      id: itemId,
      userId: user?.uid || "guest",
      type,
      titleName: title,
      content,
      tags: tags || [],
      createdAt: new Date().toISOString(),
    };

    if (user) {
      const docPath = `users/${user.uid}/saved_items/${itemId}`;
      try {
        await setDoc(doc(db, "users", user.uid, "saved_items", itemId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, docPath);
      }
    } else {
      const updated = [payload, ...savedItems];
      setSavedItems(updated);
      localStorage.setItem("vidrank_saved_items", JSON.stringify(updated));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (user) {
      const docPath = `users/${user.uid}/saved_items/${itemId}`;
      try {
        await deleteDoc(doc(db, "users", user.uid, "saved_items", itemId));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      }
    } else {
      const updated = savedItems.filter((it) => it.id !== itemId);
      setSavedItems(updated);
      localStorage.setItem("vidrank_saved_items", JSON.stringify(updated));
    }
  };

  const renderActiveTab = () => {
    const savedItemKeys = savedItems.map((s) => s.titleName);

    switch (activeTab) {
      case "keyword":
        return <KeywordPlanner onSave={handleSaveItem} savedItemKeys={savedItemKeys} />;
      case "title":
        return <TitleGenerator onSave={handleSaveItem} savedItemKeys={savedItemKeys} />;
      case "audit":
        return <VideoAudit onSave={handleSaveItem} savedItemKeys={savedItemKeys} />;
      case "tags":
        return <TagsSpecialist onSave={handleSaveItem} savedItemKeys={savedItemKeys} />;
      case "description":
        return <DescriptionArchitect onSave={handleSaveItem} savedItemKeys={savedItemKeys} />;
      case "script":
        return <ScriptOutline onSave={handleSaveItem} savedItemKeys={savedItemKeys} />;
      case "vault":
        return <SavedVault items={savedItems} onDelete={handleDeleteItem} userSignedIn={!!user} />;
      default:
        return <KeywordPlanner onSave={handleSaveItem} savedItemKeys={savedItemKeys} />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-zinc-100 flex flex-col justify-between selection:bg-red-500/20 selection:text-white">
      <div>
        {/* Navigation HUD */}
        <Navbar
          user={user}
          loading={authLoading}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          savedCount={savedItems.length}
        />

        {/* Informative connection indicator for offline users */}
        {!authLoading && !user && (
          <div className="border-b border-rose-900/30 bg-rose-950/20 px-4 py-2 text-center text-xs text-rose-300">
            <span className="font-semibold">Guest Mode Activated:</span> Data is stored locally in your browser. All AI triggers are active.
            <button
              onClick={() => document.getElementById("login-btn")?.click()}
              className="ml-2 underline hover:text-white font-bold inline-flex items-center gap-0.5"
            >
              Sign In to unlock permanent Cloud backup <Sparkles className="h-3 w-3 inline" />
            </button>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          {renderActiveTab()}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-zinc-90 w-full bg-zinc-950 px-4 py-8 mt-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600">
              <Youtube className="h-4 w-4 text-white" />
            </div>
            <span className="font-sans font-bold text-zinc-100 text-sm tracking-tight">VidRank.ai</span>
            <span className="text-zinc-500 text-xs">| Deep YouTube Auditing Suite</span>
          </div>

          <p className="text-xs text-zinc-500">
            Powered by Gemini 3.5 & Google Cloud Vertex Platforms. Developed under safe client rules.
          </p>

          <span className="text-xs text-zinc-550 flex items-center gap-1.5 justify-center">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> SECURE SSL SANDBOX
          </span>
        </div>
      </footer>
    </div>
  );
}
