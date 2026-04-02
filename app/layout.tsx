import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sintoria Bodywork — Structural Integration · St. Petersburg, FL",
  description: "Structural integration and fascial bodywork in St. Petersburg, FL. Restore alignment, resolve chronic pain, and move with ease.",
  openGraph: {
    title: "Sintoria Bodywork",
    description: "Structural integration. Where the body finds its alignment.",
    url: "https://sintoriabodywork.vercel.app",
    siteName: "Sintoria Bodywork",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
