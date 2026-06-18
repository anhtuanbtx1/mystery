import type { Metadata } from "next";
import "./globals.css";
import InkRevealToggle from "@/components/InkRevealToggle";

export const metadata: Metadata = {
  title: "Mystery Tarot - Hành Trình Thấu Hiểu Bản Thân",
  description: "Trải nghiệm Tarot huyền ảo với công nghệ Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased overflow-hidden">
        <InkRevealToggle />
        {children}
      </body>
    </html>
  );
}
