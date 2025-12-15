import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "./navbar";
import Footer from "./footer";
import Providers from "./providers";
import { Analytics } from "@vercel/analytics/next"

const titleFont = Outfit({
  variable: "--font-title",
});

const bodyFont = JetBrains_Mono({
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "iancmy",
  description: "Personal website and portfolio of Ian Comaya.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`relative ${titleFont.variable} ${bodyFont.variable} antialiased font-[family-name:var(--font-body)]`}
      >
        <Providers>
          <Navbar />
          <main
            className="mt-24 max-w-svw min-h-[calc(100svh * .90)] mx-40 not-lg:mx-4 flex flex-col items-center justify-start gap-4"
            suppressHydrationWarning
          >
            {children}
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
