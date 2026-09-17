import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snooker Club — Dashboard",
  description: "Book tables, e-games, and canteen items in a few simple steps.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
