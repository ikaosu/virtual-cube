"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthButton() {
  const supabase: SupabaseClient | null = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getUser().then(({ data }) => {
      if (active) setUser(data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  // Auth not configured (env vars missing): hide the button entirely.
  if (!supabase) return null;

  const signIn = async () => {
    setBusy(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) {
      console.error(error);
      setBusy(false);
    }
  };

  const signOut = async () => {
    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    setMenuOpen(false);
  };

  if (!user) {
    return (
      <button
        onClick={signIn}
        disabled={busy}
        className="text-sm font-medium hover:text-cyan-100 transition-colors disabled:opacity-50"
      >
        {busy ? "..." : "ログイン"}
      </button>
    );
  }

  const display =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "ユーザー";

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="text-sm font-medium hover:text-cyan-100 transition-colors flex items-center gap-1"
      >
        <span className="max-w-[8em] truncate">{display}</span>
        <span className="text-xs">▾</span>
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[10em] text-gray-800 z-10">
          <Link
            href="/profile"
            className="block px-3 py-2 text-sm hover:bg-indigo-50"
            onClick={() => setMenuOpen(false)}
          >
            マイページ
          </Link>
          <button
            onClick={signOut}
            disabled={busy}
            className="block w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 disabled:opacity-50"
          >
            ログアウト
          </button>
        </div>
      )}
    </div>
  );
}
