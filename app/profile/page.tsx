import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export default async function MyProfilePage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center text-gray-500">
        認証が未設定です (NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY)。
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const email = user.email ?? "";

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">マイページ</h1>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Google 名前</span>
          <span className="font-medium">{fullName || "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">メール</span>
          <span className="font-medium truncate ml-2">{email}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 text-sm space-y-3">
        <div className="text-gray-700 font-medium">表示名の予約</div>
        <p className="text-xs text-gray-500 leading-relaxed">
          現在は anonymous モード — 誰でも好きな名前で submit できます。
          表示名の予約 (verified バッジ + なりすまし防止) は近日実装予定です。
        </p>
        {fullName && (
          <Link
            href={`/u/${encodeURIComponent(fullName)}`}
            className="inline-block text-sm text-indigo-600 hover:underline"
          >
            「{fullName}」のソルブ履歴を見る →
          </Link>
        )}
      </div>
    </div>
  );
}
