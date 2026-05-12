import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { RightDrawer } from "@/components/right-drawer";
import { ImpersonationBanner } from "@/components/impersonation-banner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <div className="flex h-dvh w-full overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <ImpersonationBanner />
            <main className="flex-1 overflow-y-auto bg-[var(--color-paper)]">
              {children}
            </main>
          </div>
        </div>
        <RightDrawer />
      </body>
    </html>
  );
}
