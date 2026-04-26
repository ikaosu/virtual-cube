import SolverPanel from "@/components/SolverPanel";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-gray-800">3x3 ソルブ</div>
        <p className="text-gray-500 text-sm">
          スクランブルを揃えてタイムを全国ランキングへ
        </p>
      </div>
      <SolverPanel />
    </div>
  );
}
