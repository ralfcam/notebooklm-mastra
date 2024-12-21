import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Mastra NotebookLM",
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
        {children}
      </body>
    </html>
  );
}
