import { Bell, CarFront, Gavel, Home, MessageCircle, Plus, Search, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";

type MarketplaceLayoutProps = { children: ReactNode; title?: string; actions?: ReactNode };

const mobileItems = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/auctions", label: "المزادات", icon: Gavel },
  { href: "/messages", label: "الرسائل", icon: MessageCircle },
  { href: "/profile", label: "حسابي", icon: UserRound },
];

export function MarketplaceLayout({ children, title, actions }: MarketplaceLayoutProps) {
  const [location] = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  return <div className="min-h-screen bg-[#f4f6f9] text-[#18243b]" dir="rtl">
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#172b4d]/95 text-white shadow-[0_8px_26px_rgba(13,30,57,.16)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#f7ad32]"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#ffba43] to-[#e98716] text-white shadow-lg shadow-orange-950/20"><Gavel className="h-5 w-5" aria-hidden="true" /></span><span className="min-w-0 leading-tight"><strong className="block text-base font-black">مزايد سيارات</strong><span className="hidden text-xs text-slate-300 sm:block">منصة سيارات موثوقة ومزادات منظمة</span></span></Link>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="التنقل الرئيسي"><Link href="/" aria-current={location === "/" ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-[#f7ad32] ${location === "/" ? "bg-white/15 text-white" : "text-slate-200 hover:bg-white/10"}`}>الرئيسية</Link><Link href="/auctions" aria-current={location.startsWith("/auctions") ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-[#f7ad32] ${location.startsWith("/auctions") ? "bg-white/15 text-white" : "text-slate-200 hover:bg-white/10"}`}>المزادات</Link><Link href="/listings" aria-current={location.startsWith("/listings") ? "page" : undefined} className={`rounded-lg px-3 py-2 text-sm font-bold transition focus-visible:ring-2 focus-visible:ring-[#f7ad32] ${location.startsWith("/listings") ? "bg-white/15 text-white" : "text-slate-200 hover:bg-white/10"}`}>الإعلانات</Link></nav>
        <div className="flex items-center gap-1.5">{isAuthenticated ? <><Link href="/notifications" aria-label="الإشعارات" className="grid h-10 w-10 place-items-center rounded-xl text-slate-100 transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[#f7ad32]"><Bell className="h-5 w-5" aria-hidden="true" /></Link><Link href="/profile" aria-label="حسابي" className="hidden items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-bold sm:flex"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#f7ad32] text-xs text-[#172b4d]">{user?.name?.slice(0, 1) || "م"}</span><span className="max-w-24 truncate">{user?.name || "حسابي"}</span></Link></> : !loading ? <Button onClick={() => startLogin()} className="h-10 rounded-xl bg-[#f7ad32] px-4 font-extrabold text-[#172b4d] hover:bg-[#ffc25a]">دخول آمن</Button> : null}</div>
      </div>
    </header>
    {title ? <div className="border-b border-slate-200 bg-white"><div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"><h1 className="text-xl font-black text-[#172b4d]">{title}</h1>{actions}</div></div> : null}
    <main className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 sm:pb-8">{children}</main>
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex h-[70px] max-w-xl items-center justify-around border-t border-slate-200 bg-white px-2 pb-1 shadow-[0_-8px_24px_rgba(15,35,65,.1)] lg:hidden" aria-label="تنقل الجوال">{mobileItems.slice(0, 2).map((item) => <MobileItem key={item.href} {...item} active={location === item.href || (item.href !== "/" && location.startsWith(item.href))} />)}<Link href="/listings/new" aria-label="إضافة إعلان" className="-mt-8 grid h-14 w-14 place-items-center rounded-full border-4 border-[#f4f6f9] bg-gradient-to-br from-[#ffb642] to-[#e98716] text-white shadow-lg shadow-orange-900/25 transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#172b4d]"><Plus className="h-7 w-7" aria-hidden="true" /></Link>{mobileItems.slice(2).map((item) => <MobileItem key={item.href} {...item} active={location === item.href || location.startsWith(item.href)} />)}</nav>
  </div>;
}

function MobileItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) { return <Link href={href} aria-current={active ? "page" : undefined} className={`flex min-w-12 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-[#f7ad32] ${active ? "text-[#172b4d]" : "text-slate-400"}`}><Icon className={`h-5 w-5 ${active ? "text-[#e98716]" : ""}`} aria-hidden="true" /><span>{label}</span></Link>; }

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <section className="grid min-h-72 place-items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm"><div className="max-w-sm"><span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-[#fff2da] text-[#e98716]"><CarFront className="h-7 w-7" aria-hidden="true" /></span><h2 className="text-lg font-black text-[#172b4d]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>{action ? <div className="mt-5">{action}</div> : null}</div></section>; }
export function InlineSearch() { return <Link href="/listings" className="flex h-12 w-full items-center gap-3 rounded-2xl bg-white px-4 text-sm text-slate-500 shadow-md shadow-[#172b4d]/10 outline-none transition hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[#f7ad32]"><Search className="h-5 w-5 text-[#e98716]" aria-hidden="true" /><span>ابحث عن سيارة، موديل، أو مدينة</span></Link>; }
