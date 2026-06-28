import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AX Work Observatory",
  description:
    "AI에 지친 사람들을 위한 아날로그 AX 독립 연구지.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
