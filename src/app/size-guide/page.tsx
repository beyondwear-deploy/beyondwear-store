import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { SizeGuideContent } from "@/components/product/SizeGuideContent";
import { EditableText } from "@/components/edit/EditableText";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Shoe size charts (UK, EU, US) and foot-measuring tips for adults and kids. Clothing size charts are coming soon.",
  alternates: { canonical: "/size-guide" },
};

export default function SizeGuidePage() {
  return (
    <>
      <PageHero
        eyebrow="Size guide" crumbs={[{ label: "Size guide" }]}
        title={<EditableText id="size-guide.hero.title" defaultValue="Find your fit." as="span" multiline={false} />}
        blurb={<EditableText id="size-guide.hero.blurb" defaultValue="Brands size differently — and preloved shoes may have relaxed slightly. Use these charts as a guide and check the insole length on each product." />}
      />
      <div className="container-x max-w-4xl py-14 sm:py-20"><SizeGuideContent /></div>
    </>
  );
}
