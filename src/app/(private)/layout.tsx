"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPracticeRoute = pathname?.includes("/practice/");

  if (isPracticeRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "80px", minHeight: "100vh" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}
