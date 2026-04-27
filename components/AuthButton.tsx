"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function AuthButton() {
  const supabase: SupabaseClient | null = useMemo(
    () => createSupabaseBrowserClient(),
    []
  );
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

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
    <div className="flex items-center gap-3 text-sm">
      <span className="font-medium max-w-[8em] truncate">{display}</span>
      <button
        onClick={signOut}
        disabled={busy}
        className="text-xs font-medium hover:text-cyan-100 transition-colors disabled:opacity-50"
      >
        ログアウト
      </button>
    </div>
  );
}
