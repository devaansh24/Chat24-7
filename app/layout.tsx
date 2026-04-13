import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Fullstack App",
  description: "Next.js + Express + Tailwind CSS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
