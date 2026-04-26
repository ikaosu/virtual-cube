interface ScrambleDisplayProps {
  scramble: string | null;
}

export default function ScrambleDisplay({ scramble }: ScrambleDisplayProps) {
  return (
    <div className="font-mono text-base sm:text-lg text-center max-w-[600px] break-words leading-relaxed min-h-[2em] text-gray-900">
      {scramble ?? <span className="text-gray-400">スクランブル取得中…</span>}
    </div>
  );
}
