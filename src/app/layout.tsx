import type { Metadata, Viewport } from "next";
import { Jua, Gowun_Dodum } from "next/font/google";
import "./globals.css";

const jua = Jua({
  variable: "--font-jua",
  subsets: ["latin"],
  weight: "400",
});

const gowunDodum = Gowun_Dodum({
  variable: "--font-gowun",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "CookingBook",
  description: "레시피를 찍고, AI가 정리하고, 따라 요리하세요",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${jua.variable} ${gowunDodum.variable} h-full antialiased`}
    >
      <body className="h-full bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
