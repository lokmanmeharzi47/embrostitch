import type { Metadata } from "next";
import { Poppins, Playfair_Display, Cairo } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/components/shared/Toast";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import "./globals.css";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: '--font-poppins'
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

const cairo = Cairo({ 
  subsets: ["arabic"],
  variable: '--font-cairo'
});

export const metadata: Metadata = {
  title: "MALIXA | Votre destination mode féminine en Algérie",
  description:
    "MALIXA est une marketplace premium de mode féminine reliant les créatrices algériennes aux passionnées de haute couture, mode modeste et tenues traditionnelles.",
  keywords: ["MALIXA", "mode", "haute couture", "Algérie", "créatrices", "sur-mesure", "karakou", "caftan", "mode modeste"],
  openGraph: {
    title: "MALIXA | Mode Féminine & Haute Couture",
    description: "La marketplace premium dédiée à la mode féminine en Algérie.",
    url: "https://malixa.dz",
    siteName: "MALIXA",
    locale: "fr_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MALIXA | Votre destination mode féminine en Algérie",
    description: "MALIXA est une marketplace premium de mode féminine reliant les créatrices algériennes aux passionnées de haute couture.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/logo.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${poppins.variable} ${playfair.variable} ${cairo.variable} ${poppins.className} antialiased`}>
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
