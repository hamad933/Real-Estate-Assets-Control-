import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "العقارات والأصول",
    template: "%s | العقارات والأصول"
  },
  description: "تجربة متكاملة لاكتشاف العقارات ومتابعة الأصول والسجلات التشغيلية."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
