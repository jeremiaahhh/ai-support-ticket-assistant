"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Plus, Sparkles, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHealth } from "@/hooks/use-health";
import { cn } from "@/lib/utils";

export function Topbar() {
  const { data: health, isLoading, error } = useHealth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const dark = (resolvedTheme ?? theme) === "dark";

  const live = !isLoading && !error;
  const mock = health?.mock_mode ?? true;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
            live
              ? "border-success/30 bg-success/10 text-success"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              live ? "animate-pulse bg-success" : "bg-destructive",
            )}
          />
          {live ? "Backend healthy" : "Backend unreachable"}
        </div>

        <div
          className={cn(
            "hidden items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium sm:flex",
            mock
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500",
          )}
        >
          <Sparkles className="h-3 w-3" />
          {mock ? "Mock AI mode" : `Live · ${health?.ai_provider ?? "anthropic"}`}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle theme"
          onClick={() => setTheme(dark ? "light" : "dark")}
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button asChild>
          <Link href="/tickets/new">
            <Plus className="h-4 w-4" />
            New ticket
          </Link>
        </Button>
      </div>
    </header>
  );
}
