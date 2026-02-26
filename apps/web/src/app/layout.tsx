import type { Metadata } from "next";
import "./globals.css";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "ElasticOS - Employment Elasticity Infrastructure",
  description: "Transform employment from binary states into continuous, measurable engagement",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  );
}
