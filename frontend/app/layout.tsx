import type { Metadata } from "next";
import { Toaster } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Support Ticket Triage",
  description:
    "Triage, summarize, and reply to customer support tickets. Built with FastAPI and Next.js.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AppShell>{children}</AppShell>
          <Toaster
            richColors
            theme="system"
            position="bottom-right"
            closeButton
            duration={3500}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
