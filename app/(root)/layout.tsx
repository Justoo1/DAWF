import Footer from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "DEVOPS AFRICA Welfare Fund Dashboard",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex min-h-screen flex-col bg-zinc-950">
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </div>
  );
}
