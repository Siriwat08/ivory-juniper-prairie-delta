import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  Compass,
  MessageSquareText,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDesk } from "@/lib/store";
import { incompleteGapCount } from "@/lib/engine/policy";

const NAV = [
  { to: "/drive", label: "โหมดคนขับ", short: "คนขับ", icon: Truck },
  { to: "/", label: "โต๊ะปฏิบัติการ", short: "โต๊ะ", icon: ClipboardList },
  { to: "/plan", label: "วางแผนเที่ยว", short: "วางแผน", icon: Compass },
  { to: "/agent", label: "Agent", short: "Agent", icon: MessageSquareText },
  { to: "/policy", label: "นโยบาย / ช่องว่าง", short: "นโยบาย", icon: ShieldAlert },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const policy = useDesk((s) => s.policy);
  const setHydrated = useDesk((s) => s.setHydrated);
  const gaps = incompleteGapCount(policy);

  useEffect(() => {
    setHydrated(true);
  }, [setHydrated]);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="hidden bg-navy text-navy-fg lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo-phaopanya.png"
              alt="เผ่าปัญญา ทรานสปอร์ต"
              className="h-14 w-14 rounded-lg bg-navy-fg object-contain p-1"
            />
            <div>
              <p className="font-display text-sm font-semibold leading-tight">
                เผ่าปัญญา
              </p>
              <p className="text-[11px] tracking-wide text-navy-fg/70">
                Route Desk
              </p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-navy-fg/55">
                งานลูกค้า
              </p>
              <p className="text-xs font-medium">SCGJWD Logistics</p>
            </div>
            <img
              src="/logo-scgjwd.png"
              alt="SCGJWD"
              className="h-7 w-auto rounded-sm bg-navy-fg px-1.5 py-1"
            />
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/" || pathname.startsWith("/trip")
                : pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                  active
                    ? "bg-navy-fg text-navy"
                    : "text-navy-fg/80 hover:bg-white/10 hover:text-navy-fg",
                )}
              >
                <Icon className="size-4" />
                <span className="flex-1">{item.label}</span>
                {item.to === "/policy" && gaps > 0 ? (
                  <span className="rounded-full bg-danger-fg px-1.5 text-[10px] font-semibold text-danger">
                    {gaps}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <p className="px-5 py-4 text-[11px] leading-relaxed text-navy-fg/45">
          กฎปฏิบัติการเที่ยวนี้: ขับต่อเนื่องไม่เกิน 4 ชม. พัก 30 นาที
          ไม่ใช่ข้อสรุปกฎหมาย
        </p>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-bg/90 px-4 py-3 backdrop-blur-sm lg:hidden">
          <img
            src="/logo-phaopanya.png"
            alt=""
            className="h-10 w-10 rounded-md bg-navy object-contain"
          />
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold">เผ่าปัญญา Route Desk</p>
            <p className="truncate text-[11px] text-muted">งาน SCGJWD</p>
          </div>
          <img src="/logo-scgjwd.png" alt="" className="h-6 w-auto" />
        </header>
        <main className="flex-1 px-4 py-5 pb-24 lg:px-8 lg:py-7 lg:pb-7">
          {children}
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-border bg-surface/95 backdrop-blur-sm lg:hidden">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/" || pathname.startsWith("/trip")
                : pathname === item.to;
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px]",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon className="size-4" />
                {item.short}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
