import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import ToastProvider from "@/components/shared/Toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EmbroCraftDZ | Couture Artisanale Algérienne",
  description:
    "Connectez-vous avec des couturières expertes et des ateliers de broderie pour donner vie à vos créations uniques. Des tenues quotidiennes aux robes de luxe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
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
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <ToastProvider />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
