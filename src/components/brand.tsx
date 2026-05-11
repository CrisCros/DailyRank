import Link from "next/link";

export function Brand() {
  return (
    <Link className="flex items-center gap-2 font-semibold tracking-tight" href="/">
      <span className="flex size-9 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-600/20">
        DR
      </span>
      <span>DayRank</span>
    </Link>
  );
}
