import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { SessionProvider } from "@/providers/index";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NotebookLM",
  description: "AI-Powered Podcast Generation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <SessionProvider>
        <body
          className={`${fontSans.variable} ${fontSans.className} antialiased`}
        >
          {children}
          <Toaster richColors closeButton />
        </body>
      </SessionProvider>
    </html>
  );
}
