import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});
const jbMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Kenshō | Code Intelligence Engine",
  description:
    "A system that thinks like a senior engineer. Deep understanding + reasoning, performance analysis, and risk scanning for your GitHub repos.",
  keywords: [
    "Code Intelligence",
    "AST Parsing",
    "GitHub Analyzer",
    "Tech Stack Extraction",
    "Bug Scanner",
  ],
  authors: [{ name: "Thor" }],
  openGraph: {
    title: "Kenshō — Code Intelligence Engine",
    description:
      "Don't guess where the bug is. Build systems that make the truth impossible to hide.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jbMono.variable} h-full antialiased scroll-smooth`}
    >
      <body
        className={`font-sans min-h-full flex flex-col bg-slate-50 antialiased selection:bg-slate-200`}
      >
        {children}
      </body>
    </html>
  );
}
