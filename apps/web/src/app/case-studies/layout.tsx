import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Case Studies | ElasticOS",
  description: "How forward-thinking organisations transform employment infrastructure with ElasticOS. Real results from logistics, consulting, and healthcare.",
};

export default function CaseStudiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
