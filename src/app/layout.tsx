import { Plus_Jakarta_Sans, Inter, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";

import { TooltipProvider } from "@/components/ui/tooltip";
import { buildRootMetadata } from "@/lib/metadata/buildMetadata";
import { QueryProvider } from "@/lib/query";

import type { ReactNode } from "react";

import "./globals.css";
import "./brand.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jakartaSans.variable} ${interFont.variable} ${geistMono.variable} bg-background text-foreground min-h-screen font-sans antialiased`}
      >
        <QueryProvider>
          <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
          <Toaster position="top-right" richColors />
        </QueryProvider>
      </body>
    </html>
  );
}
