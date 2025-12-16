import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Header from "./modules/components/header";
import BottomNav from "./modules/components/bottom-nav";

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
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <BottomNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
