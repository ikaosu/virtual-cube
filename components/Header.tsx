import Link from "next/link";

const CUBE_COLORS = [
  "bg-red-500",
  "bg-white",
  "bg-blue-500",
  "bg-orange-500",
  "bg-yellow-400",
  "bg-green-500",
  "bg-white",
  "bg-blue-500",
  "bg-red-500",
];

function CubeIcon() {
  return (
    <div
      className="grid grid-cols-3 gap-[1.5px] w-7 h-7 rounded-md overflow-hidden bg-slate-900/40 p-[1.5px] shadow-inner"
      aria-hidden
    >
      {CUBE_COLORS.map((cls, i) => (
        <div key={i} className={`${cls} rounded-[1.5px]`} />
      ))}
    </div>
  );
}

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 text-white shadow-md">
      <nav className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <CubeIcon />
          <span className="text-lg font-bold tracking-wide">バーチャルキューブ</span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium">
          <Link href="/" className="hover:text-cyan-100 transition-colors">
            ソルブ
          </Link>
          <Link
            href="/rankings"
            className="hover:text-cyan-100 transition-colors"
          >
            ランキング
          </Link>
        </div>
      </nav>
    </header>
  );
}
