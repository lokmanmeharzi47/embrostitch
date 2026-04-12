"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: "var(--color-card)",
          color: "var(--color-foreground)",
          border: "1px solid var(--color-border)",
          borderRadius: "12px",
          padding: "12px 16px",
          fontSize: "14px",
          fontFamily: "var(--font-family-sans)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#ef4444", secondary: "#fff" },
        },
      }}
    />
  );
}
