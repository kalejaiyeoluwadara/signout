import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Toaster from "@/components/toast/Toaster";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "signout — leave your mark",
  description:
    "The digital signout shirt. Create your shirt, share your link, and let friends sign it with a marker — forever.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
