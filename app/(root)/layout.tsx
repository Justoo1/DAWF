import Footer from "@/components/shared/Footer";
import { Navbar } from "@/components/shared/Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "DevOps Africa Welfare Fund Dashboard",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div
        className="flex flex-col 2xl:space-y-32"
      >
        <Navbar />
        {children}
        <Footer />
      </div>
  );
}
