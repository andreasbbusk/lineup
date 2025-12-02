import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import BottomNav from "./components/bottom-nav";

export const metadata: Metadata = {
  title: "LineUp",
  description: "LineUp Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
        <BottomNav />
      </body>
    </html>
  );
}
