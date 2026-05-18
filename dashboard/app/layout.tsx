import type { Metadata } from "next";
import { Inter, Roboto } from "next/font/google";
import { ClientProviders } from "@/components/ClientProviders";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  display: "swap", // Prevents invisible text during load
  variable: "--font-roboto",
  weight: "400", // Define a CSS variable name
});

export const metadata: Metadata = {
  title: "CargoPin Dashboard",
  description: "A modern dashboard for port operations management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${roboto.variable} ${roboto.className} h-full `}
    >
      <body className="min-h-full flex flex-col">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
