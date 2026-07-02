import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { GlobalKeybotLauncher } from "@/components/global-keybot-launcher";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sharkeys",
  description:
    "sharkeys is an AI-assisted custom mechanical keyboard configuration platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface text-primary">
        {children}
        <GlobalKeybotLauncher />
      </body>
    </html>
  );
}
