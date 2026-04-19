import Footer from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import { PLATFORM_NAME } from "@/lib/brand";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: `${PLATFORM_NAME} dashboard`,
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </div>
  );
}
