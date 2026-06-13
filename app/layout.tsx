import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sisustusapp",
  description: "Moodboard-editori sisustussuunnittelijoille",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
