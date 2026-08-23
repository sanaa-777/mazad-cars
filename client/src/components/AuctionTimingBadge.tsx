import { CalendarClock, Clock3, Flag, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuctionTimingInfo } from "@/lib/marketplace";

type AuctionTimingBadgeProps = { startsAt?: Date | number | string | null; endsAt?: Date | number | string | null; status?: string | null };

const visuals = {
  scheduled: { className: "bg-[#fff2da]/95 text-[#9a5710] ring-[#f7ad32]/40", Icon: CalendarClock },
  live: { className: "bg-[#122846]/90 text-white ring-white/20", Icon: Clock3 },
  ended: { className: "bg-slate-900/85 text-slate-100 ring-white/15", Icon: Flag },
  cancelled: { className: "bg-red-950/80 text-red-100 ring-red-200/20", Icon: XCircle },
};

export function AuctionTimingBadge({ startsAt, endsAt, status }: AuctionTimingBadgeProps) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, []);
  const timing = getAuctionTimingInfo({ startsAt, endsAt, status, now });
  const { className, Icon } = visuals[timing.state];
  return <span data-auction-timer-state={timing.state} className={`inline-flex max-w-[calc(100%-4.5rem)] items-center gap-1 rounded-full px-2 py-1 text-[9px] font-black shadow-sm ring-1 backdrop-blur sm:px-2.5 sm:text-[11px] ${className}`} aria-label={`${timing.label}: ${timing.detail}`} aria-live="polite"><Icon className="h-3 w-3 shrink-0" aria-hidden="true" /><span className="whitespace-nowrap">{timing.label} <b dir="ltr" className="font-black tabular-nums">{timing.detail}</b></span></span>;
}
