import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sintoria Bodywork — St. Petersburg, FL",
  description: "Therapeutic bodywork rooted in intention. Massage & wellness in St. Pete.",
  openGraph: {
    title: "Sintoria Bodywork",
    description: "Where the body finds its axis.",
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
