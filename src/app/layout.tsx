import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://info-masjidgino.vercel.app'),
  title: "Display TV & Signage Masjid Gino Sugiono",
  description: "Aplikasi Informasi Digital Signage & TV Display Masjid Gino Sugiono, Perumahan Skyland 2",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Display TV & Signage Masjid Gino Sugiono",
    description: "Aplikasi Informasi Digital Signage & TV Display Masjid Gino Sugiono, Perumahan Skyland 2",
    url: "https://info-masjidgino.vercel.app",
    siteName: "Masjid Gino Sugiono",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Logo Masjid Gino Sugiono",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
