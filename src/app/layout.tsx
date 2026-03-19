import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IELTS9s — Chinh phục Band 9",
  description: "Nền tảng luyện IELTS Listening & Reading thông minh nhất Việt Nam. Học nhanh, học rẻ, học đúng chỗ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
