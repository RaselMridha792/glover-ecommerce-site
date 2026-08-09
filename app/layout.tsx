import type { Metadata } from "next";
import { Anton, Archivo, Archivo_Narrow, Space_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import Reveal from "@/components/Reveal";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-anton", display: "swap" });
const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const narrow = Archivo_Narrow({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-narrow",
  display: "swap",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.weareglover.com"),
  title: {
    default: "Glover Boxing — We Are Glover",
    template: "%s — Glover Boxing",
  },
  description:
    "Glover Sports. Premium boxing gloves and equipment built to perform, designed to stand out. We are not just gear. We are Glover.",
  openGraph: {
    type: "website",
    siteName: "Glover Boxing",
    images: ["/images/products/detail-crown-logo.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${archivo.variable} ${narrow.variable} ${spaceMono.variable}`}
    >
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
          <CartDrawer />
        </CartProvider>
        <Reveal />
      </body>
    </html>
  );
}
