import { Geist, Geist_Mono, Inter } from "next/font/google";
import { Toaster } from "sonner";

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
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
