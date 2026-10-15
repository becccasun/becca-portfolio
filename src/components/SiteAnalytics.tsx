import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { STATIC_EXPORT } from "@/lib/base";

// Two trackers, only on the Vercel site (the GitHub Pages copy has no /_vercel endpoint):
// - Vercel Web Analytics: visitors, page views, bounce rate, top pages, referrers, devices.
//   Turn it on under the project's Analytics tab.
// - Microsoft Clarity: scroll depth (where people drop off), active time on page, heatmaps
//   and session recordings. Loads once NEXT_PUBLIC_CLARITY_ID is set in Vercel.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export default function SiteAnalytics() {
  if (STATIC_EXPORT) return null;
  return (
    <>
      <Analytics />
      {CLARITY_ID && (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(CLARITY_ID)});`}
        </Script>
      )}
    </>
  );
}
