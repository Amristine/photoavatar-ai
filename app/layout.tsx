import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhotoAvatar AI — Create talking avatar videos",
  description: "Create expressive AI avatar videos from your photo, voice recording and script."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}