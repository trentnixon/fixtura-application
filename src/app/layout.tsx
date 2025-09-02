import { Geist, Geist_Mono, Inter } from "next/font/google";
import Link from "next/link";
import { Toaster } from "sonner";

import { Button } from "@/components/ui/button";
import { QueryProvider } from "@/lib/query";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import "./brand.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const brandFont = Inter({
  variable: "--font-brand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Application Platform – Fixture",
  description: "Application Platform for tooling verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${brandFont.variable} bg-background text-foreground min-h-screen antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <header className="border-b">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="font-semibold tracking-tight">
                Fixture Application Platform
              </Link>
              <nav className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/">Home</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href="/">Docs</Link>
                </Button>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            <QueryProvider>
              <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
            </QueryProvider>
          </main>
          <footer className="border-t">
            <div className="text-muted-foreground mx-auto max-w-6xl px-4 py-3 text-sm">
              Application Platform • Next.js 15 • React 19
            </div>
          </footer>
          <Toaster position="top-right" richColors />
        </div>
      </body>
    </html>
  );
}
