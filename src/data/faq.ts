
export interface FaqGroup { title: string; items: { q: string; a: string }[] }

export const FAQ: FaqGroup[] = [
  {
    title: "About preloved",
    items: [
      { q: "What do you sell?", a: "We're launching with preloved shoes — sneakers, boots and everyday pairs for men, women and kids. Jackets, clothing, bags and accessories are coming soon; join the list on the Coming Soon page to hear first." },
      { q: "What does preloved mean?", a: "Preloved simply means previously owned. Every pair we sell has had a first life with someone else and is now getting a second one — after being inspected, cleaned and photographed by us. Preloved doesn't mean compromised." },
      { q: "How do you check product condition?", a: "Every pair is inspected in person: soles, stitching, insoles, lining, laces and uppers. We grade it using our five-step condition system (New / Unused, Like New, Excellent, Good, Fair), write out every sign of wear, and photograph close-ups of anything you should know about." },
      { q: "Are products authentic?", a: "We source carefully and review branded items against label details, stitching, hardware and production codes before listing. If a pair can't be confidently verified, we don't list it. Each product page shows its authenticity note." },
      { q: "How are product measurements provided?", a: "Every listing includes measurements taken by us in inches — including insole length, width and heel height. Brands size differently, so always compare with a pair you already own rather than relying on the size label." },
      { q: "What happens if an item is sold out?", a: "Most pairs are one-of-one, so once a pair is sold it shows as SOLD OUT and can't be added to the bag. You can save pairs to your wishlist, browse similar shoes, or join the newsletter to hear about new arrivals first." },
    ],
  },
  {
    title: "Ordering & delivery",
    items: [
      { q: "What payment methods are available?", a: "Cash on Delivery, Bank Transfer and Online Payment (where enabled). At checkout you choose the method that suits you." },
      { q: "Do you offer Cash on Delivery?", a: "Yes — Cash on Delivery is available for delivery addresses across the country. Please keep the exact amount ready for the courier." },
      { q: "How long does delivery take?", a: "Standard delivery takes 3–5 working days and Express takes 1–2 working days to major cities. You'll receive a tracking update as your order moves from packed to delivered." },
    ],
  },
  {
    title: "Returns & exchanges",
    items: [
      { q: "Can I return an item?", a: "If a pair isn't as described, contact us within 48 hours of delivery with photos and we'll make it right. Because every pair is one-of-one and honestly described, change-of-mind returns are handled under our Return & Exchange Policy." },
      { q: "Can I exchange an item?", a: "Since most pairs are one-of-one, an exchange means swapping for another available pair of equal or greater value, subject to availability. See the Return & Exchange Policy for the full details." },
    ],
  },
];

