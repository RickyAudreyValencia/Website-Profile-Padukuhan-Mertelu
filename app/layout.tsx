"use client";

import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "../src/components/Navbar";
import { AuthProvider } from "../src/context/AuthContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-slate-900">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-4 md:pt-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
