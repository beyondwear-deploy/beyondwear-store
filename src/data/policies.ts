/**
 * POLICY CONTENT — plain data so it's trivial to edit (or load from the CMS later).
 * These are sensible starting drafts, NOT legal advice: have them reviewed
 * against local consumer law before launch.
 */
export interface PolicySection { heading: string; body: string[] }
export interface Policy { slug: string; title: string; summary: string; updated: string; sections: PolicySection[] }

export const POLICIES: Policy[] = [
  {
    slug: "shipping", title: "Shipping Policy", summary: "How and when your order is packed, shipped and delivered.", updated: "1 September 2026",
    sections: [
      { heading: "Processing time", body: ["Orders are inspected, re-checked and packed within 1–2 working days of confirmation. Bank Transfer orders are processed once payment is verified."] },
      { heading: "Delivery methods & timing", body: ["Standard delivery: 3–5 working days. Express delivery: 1–2 working days to major cities. Studio pickup is available by appointment.", "Delivery charges are shown at checkout. Standard delivery is free on orders over Rs 5,000."] },
      { heading: "Tracking", body: ["You can follow your order at any time on the Track Order page using your order number and the email or phone used at checkout."] },
      { heading: "Packaging", body: ["Items are cleaned, folded or wrapped and packed in protective packaging so they arrive in the condition described."] },
      { heading: "Delays & undeliverable parcels", body: ["Courier delays can happen. If your parcel is late, contact us and we'll follow up. Parcels refused or undeliverable after repeated attempts are returned to us and handled under the Refund Policy."] },
    ],
  },
  {
    slug: "returns", title: "Return & Exchange Policy", summary: "What happens if an item isn't right.", updated: "1 September 2026",
    sections: [
      { heading: "Items not as described", body: ["If an item arrives materially different from its listing (condition, measurements or authenticity), contact us within 48 hours of delivery with clear photos. We'll offer a replacement (if available), store credit or a refund."] },
      { heading: "Change of mind", body: ["Because every pair is one-of-one and listed with detailed condition notes and measurements, we encourage you to check them carefully. Change-of-mind returns may be accepted within 3 days for unworn items with all tags/labels intact, at the customer's cost of return shipping."] },
      { heading: "Exchanges", body: ["An exchange is a swap for another available pair of equal or greater value, subject to availability. Any price difference is payable before dispatch."] },
      { heading: "Items we can't take back", body: ["Worn, washed or altered items; items returned without notice; and items marked Final Sale."] },
      { heading: "How to start", body: ["Contact us on WhatsApp or by email with your order number and photos. We'll confirm the next steps within one working day."] },
    ],
  },
  {
    slug: "refunds", title: "Refund Policy", summary: "How and when approved refunds are paid.", updated: "1 September 2026",
    sections: [
      { heading: "Approved refunds", body: ["Once a return is received and checked (or a not-as-described claim is approved), refunds are issued to the original payment method or as store credit, at your choice."] },
      { heading: "Timing", body: ["Refunds are processed within 5–7 working days of approval. Bank transfers and gateway refunds may take additional time depending on your bank."] },
      { heading: "Cash on Delivery orders", body: ["Refunds for COD orders are made by bank transfer or store credit."] },
      { heading: "Delivery charges", body: ["Original delivery charges are refunded when the return is due to our error."] },
    ],
  },
  {
    slug: "privacy", title: "Privacy Policy", summary: "What data we collect, why, and how we protect it.", updated: "1 September 2026",
    sections: [
      { heading: "What we collect", body: ["Information you give us when ordering or contacting us: name, phone, email, delivery address and order details. We also collect basic, anonymous usage data to improve the site."] },
      { heading: "How we use it", body: ["To process and deliver orders, provide support, send order updates and — only if you opt in — send newsletters. We never sell your personal data."] },
      { heading: "Payments", body: ["We do not store card details. Online payments are handled by the payment provider; Bank Transfer details are only ever used to verify your payment."] },
      { heading: "Security", body: ["We use industry-standard safeguards and only keep the data we need. Access to customer data is restricted."] },
      { heading: "Your choices", body: ["You can request access to, correction of, or deletion of your data at any time by contacting us. You can unsubscribe from marketing emails using the link in any email."] },
    ],
  },
  {
    slug: "terms", title: "Terms & Conditions", summary: "The rules for using our store and buying from us.", updated: "1 September 2026",
    sections: [
      { heading: "Our products", body: ["All items are preloved. Condition, measurements and descriptions are provided in good faith and photographed for transparency. Colours may vary slightly between screens."] },
      { heading: "One-of-one stock", body: ["Most items are single pairs. An item is only reserved once your order is placed; if an item becomes unavailable we'll notify you and refund any payment made."] },
      { heading: "Pricing", body: ["Prices are in Pakistani Rupees (PKR). 'Original / reference price' is an indication of the typical new retail price and is provided for context only."] },
      { heading: "Orders & payment", body: ["We may cancel orders that cannot be fulfilled or that appear fraudulent. Payment methods available are shown at checkout."] },
      { heading: "Liability", body: ["To the extent permitted by law, our liability is limited to the value of the order. Nothing here limits your statutory consumer rights."] },
      { heading: "Changes", body: ["We may update these terms from time to time. The version published on this page applies to your order."] },
    ],
  },
];
export const getPolicy = (slug: string) => POLICIES.find((p) => p.slug === slug);
