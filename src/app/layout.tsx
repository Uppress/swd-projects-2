import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Projects | Fieldnotes",
  description: "A focused overview of your projects and their progress.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}