import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Applai — Get briefed before your next job interview",
  description: "Paste your CV and a job description. Applai analyzes the match, highlights skill gaps, and generates tailored interview questions — in seconds.",
  openGraph: {
    title: "Applai — Get briefed before your next job interview",
    description: "Paste your CV and a job description. Applai analyzes the match, highlights skill gaps, and generates tailored interview questions — in seconds.",
    type: "website",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
}>) {
  const locale = params ? (await params).locale || 'en' : 'en';

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
