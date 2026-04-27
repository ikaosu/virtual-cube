interface ScrambleDisplayProps {
  scramble: string | null;
}

export default function ScrambleDisplay({ scramble }: ScrambleDisplayProps) {
  return (
    <div className="font-mono text-sm sm:text-base text-center max-w-[600px] break-words leading-snug min-h-[1.5em] text-gray-900">
      {scramble ?? <span className="text-gray-400">スクランブル取得中…</span>}
    </div>
  );
}
