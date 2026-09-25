/**
 * REAL CUSTOMER REVIEWS.
 * Add real reviews here as they come in (or load from a `reviews` table once
 * a backend is connected). Left empty on purpose — the homepage shows an
 * honest "just getting started" message instead of placeholder quotes until
 * there's something real to show.
 */
export interface Testimonial { name: string; city: string; rating: number; text: string; item: string }

export const TESTIMONIALS: Testimonial[] = [];
