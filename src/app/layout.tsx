import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/oswald";
import "@/styles/globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/Providers";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { isAdmin } from "@/lib/adminAuth";
import { siteConfig } from "@/lib/config";
import { getOverrides } from "@/lib/content";
import { setCustomProductsCache } from "@/lib/customProductsCache";
import { fetchCustomProducts } from "@/lib/customProducts";
import { setProductOverrideCache } from "@/lib/productOverrideCache";
import { fetchAllProductOverrides } from "@/lib/productOverrides";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.brand.domain),
  title: { default: siteConfig.seo.defaultTitle, template: siteConfig.seo.titleTemplate },
  description: siteConfig.brand.description,
  applicationName: siteConfig.brand.name,
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.png" },
  openGraph: {
    type: "website", siteName: siteConfig.brand.name, locale: "en_PK", title: siteConfig.seo.defaultTitle,
    description: siteConfig.brand.description, images: [{ url: siteConfig.seo.ogImage, width: 1200, height: 630, alt: `${siteConfig.brand.name} — ${siteConfig.brand.tagline}` }],
  },
  twitter: { card: "summary_large_image", title: siteConfig.seo.defaultTitle, description: siteConfig.brand.description, images: [siteConfig.seo.ogImage] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f4f1ea" }, { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" }],
};

// Runs before first paint so there is never a light→dark flash.
// BeyondWear defaults to dark (its primary brand look) unless the visitor already chose light.
const themeScript = `(function(){try{var t=localStorage.getItem('beyondwear.theme');if(t!=='light'&&t!=='dark'){t='dark'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','dark')}})();`;

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: siteConfig.brand.name,
  description: siteConfig.brand.description,
  url: siteConfig.brand.domain,
  logo: `${siteConfig.brand.domain}/favicon.png`,
  image: `${siteConfig.brand.domain}${siteConfig.seo.ogImage}`,
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.phone,
  priceRange: "Rs",
  address: { "@type": "PostalAddress", addressLocality: "Karachi", addressCountry: "PK" },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "11:00", closes: "19:00" },
  ],
  sameAs: Object.values(siteConfig.socials).map((s) => s.url),
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
// Retargeting pixels for paid Meta/TikTok ads — same safe pattern as GA above:
// no-op entirely until the matching env var is set (see .env.example).
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [admin, overrides, productOverrides, customProducts] = await Promise.all([
    isAdmin(), getOverrides(), fetchAllProductOverrides(), fetchCustomProducts(),
  ]);
  setProductOverrideCache(productOverrides);
  setCustomProductsCache(customProducts);
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
        {/* Google Analytics — only loads if NEXT_PUBLIC_GA_ID is set (see .env.example). No-op otherwise. */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
        {/* Meta (Facebook/Instagram) Pixel — only loads if NEXT_PUBLIC_META_PIXEL_ID is set. No-op otherwise. */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
        {/* TikTok Pixel — only loads if NEXT_PUBLIC_TIKTOK_PIXEL_ID is set. No-op otherwise. */}
        {TIKTOK_PIXEL_ID && (
          <Script id="tiktok-pixel-init" strategy="afterInteractive">
            {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<e.methods.length;n++)ttq.setAndDefer(e,e.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('${TIKTOK_PIXEL_ID}');ttq.page();}(window,document,'ttq');`}
          </Script>
        )}
      </head>
      <body>
        {META_PIXEL_ID && (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
          </noscript>
        )}
        <a href="#main" className="fixed left-4 top-4 z-[400] -translate-y-24 rounded-full bg-fg px-5 py-3 text-sm font-semibold text-bg transition-transform focus:translate-y-0">Skip to content</a>
        <Providers isAdmin={admin} contentOverrides={overrides}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
