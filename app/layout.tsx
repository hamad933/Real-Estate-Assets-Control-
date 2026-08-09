import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RP04 — العقارات والأصول",
  description: "أساس تنفيذي تجريبي مُصرّح به لمساحات RP04."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
