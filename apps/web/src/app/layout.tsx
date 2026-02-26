import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";

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
      <body className="font-sans antialiased min-h-screen flex flex-col text-foreground bg-background leading-body">
        <Providers>
          <ScrollToTop />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
