import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECOタイプ全国調査｜エコ自己診断",
  description: "あなたのエコの知識と行動傾向が、遊び感覚でわかる自己診断ツール。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
