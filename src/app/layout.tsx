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
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.phone,
  sameAs: Object.values(siteConfig.socials).map((s) => s.url),
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [admin, overrides, productOverrides] = await Promise.all([isAdmin(), getOverrides(), fetchAllProductOverrides()]);
  setProductOverrideCache(productOverrides);
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
      </head>
      <body>
        <a href="#main" className="fixed left-4 top-4 z-[400] -translate-y-24 rounded-full bg-fg px-5 py-3 text-sm font-semibold text-bg transition-transform focus:translate-y-0">Skip to content</a>
        <Providers isAdmin={admin} contentOverrides={overrides}>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
