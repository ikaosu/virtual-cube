import { formatTime } from "@/lib/format-time";

interface TimerProps {
  ms: number;
  active?: boolean;
}

export default function Timer({ ms, active }: TimerProps) {
  return (
    <div
      className={`font-mono tabular-nums text-3xl sm:text-4xl font-bold transition-colors ${
        active ? "text-red-500" : "text-gray-900"
      }`}
    >
      {formatTime(ms)}
    </div>
  );
}
