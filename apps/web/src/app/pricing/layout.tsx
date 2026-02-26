import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing | ElasticOS",
  description: "Simple, transparent pricing for Individual, Team, and Enterprise. Scale from freelancers to large organisations.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
