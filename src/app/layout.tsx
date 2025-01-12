import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import SessionProvider from "@/providers";

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
      <body
        className={`${fontSans.variable} ${fontSans.className} antialiased`}
      >
        <SessionProvider>
          {children}
          <Toaster richColors closeButton />
        </SessionProvider>
      </body>
    </html>
  );
}
