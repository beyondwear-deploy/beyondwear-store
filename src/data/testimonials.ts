/**
 * DEMO CONTENT — placeholder reviews so the layout can be evaluated.
 * These are NOT real customer reviews. Replace with genuine feedback (or load
 * from the `reviews` table) before launch. While `siteConfig.demoMode` is true
 * the section is visibly labelled as demo content.
 */
export interface Testimonial { name: string; city: string; rating: number; text: string; item: string }

export const TESTIMONIALS: Testimonial[] = [
  { name: "Customer Name", city: "City", rating: 5, item: "Sneakers", text: "Placeholder review: the photos showed every detail, so what arrived matched exactly what I expected." },
  { name: "Customer Name", city: "City", rating: 5, item: "Sneakers", text: "Placeholder review: the condition notes were honest and the pair arrived clean and well packed." },
  { name: "Customer Name", city: "City", rating: 4, item: "Boots", text: "Placeholder review: the measurements were spot on and delivery was quick. Replace with a real customer quote." },
];
