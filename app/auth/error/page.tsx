import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 text-center space-y-3">
        <div className="text-lg font-bold text-red-600">ログインに失敗しました</div>
        <p className="text-sm text-gray-500">
          時間をおいてもう一度お試しください。
        </p>
        <Link
          href="/"
          className="inline-block text-sm text-indigo-600 hover:underline"
        >
          ホームに戻る →
        </Link>
      </div>
    </div>
  );
}
