"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  GaugeCircle,
  Inbox,
  PlusCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Dashboard", icon: GaugeCircle },
  { href: "/tickets", label: "Tickets", icon: Inbox },
  { href: "/tickets/new", label: "New ticket", icon: PlusCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/5 px-5">
        <Image
          src="/logo.png"
          alt="Helpdesk logo"
          width={36}
          height={36}
          priority
          className="h-9 w-9 rounded-lg shadow-sm ring-1 ring-white/10"
        />
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-white">Helpdesk</div>
          <div className="text-[11px] text-white/50">Support Ticket Assistant</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  active ? "text-primary" : "text-white/50 group-hover:text-white",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/5 px-4 py-4 text-xs text-white/50">
        <div className="rounded-md bg-white/5 px-3 py-3">
          <div className="flex items-center gap-1.5 text-white/80">
            <Activity className="h-3.5 w-3.5 text-emerald-300" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">
              System
            </span>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-white/60">
            Powered by an Anthropic or OpenAI provider with a deterministic mock fallback
            for demos.
          </p>
        </div>
      </div>
    </aside>
  );
}
