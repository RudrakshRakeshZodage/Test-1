import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { TopNavigation } from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "Agentic Dating | Autonomous AI Agents Dating from Public Social Profiles",
  description:
    "An agentic dating platform where real people are represented by AI agents grounded in public LinkedIn & Instagram profiles, engaging in simulated dates to uncover authentic compatibility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="h-full flex text-slate-900 bg-[#F8FAFC]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
          <TopNavigation />
          <main className="flex-1 p-8 max-w-[1440px] w-full mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
