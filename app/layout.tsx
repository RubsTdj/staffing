import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { RightDrawer } from "@/components/right-drawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Popsgo — Operating workspace",
  description: "Le système opérationnel des équipes de staffing médical.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="h-full">
        <div className="flex h-dvh w-full overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-[var(--color-paper)]">
            {children}
          </main>
        </div>
        <RightDrawer />
      </body>
    </html>
  );
}
