import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Store } from "@/store/Store";
import Shell from "@/components/Shell";
import Toaster from "@/components/Toaster";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NEMTEK Inventory & POS",
  description: "Inventory, point of sale and store management for NEMTEK Store Ghana — owner and staff.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} antialiased`} suppressHydrationWarning>
      <body>
        <Store>
          <Shell>{children}</Shell>
          <Toaster />
        </Store>
      </body>
    </html>
  );
}
