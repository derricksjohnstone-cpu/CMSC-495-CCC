import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leave Hub",
  description: "A leave request and approval system for managing employee time-off requests, tracking balances, and streamlining the approval process.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${rubik.variable} h-full antialiased`}
    >
      <body className="font-(family-name:--font-rubik) min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}