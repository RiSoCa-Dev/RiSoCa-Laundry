'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function AdSenseTopAnchor() {
  useEffect(() => {
    try {
      // Initialize AdSense ads after component mounts
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
      }
    } catch (err) {
      console.error('AdSense initialization error:', err);
    }
  }, []);

  return (
    <>
      {/* AdSense Top Anchor Ad Container - No spacing */}
      <div 
        className="w-full m-0 p-0 block overflow-hidden" 
        style={{ 
          margin: 0, 
          padding: 0,
          lineHeight: 0,
        }}
      >
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            margin: 0,
            padding: 0,
            width: '100%',
          }}
          data-ad-client="ca-pub-1036864152624333"
          data-ad-slot="YOUR_AD_SLOT_ID"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
      
      {/* SEO-friendly text content for search engine bots to crawl */}
      {/* This helps with SEO while the ad loads */}
      <div className="sr-only" aria-hidden="true">
        <h1>RKR Laundry Service - Professional Laundry Services</h1>
        <p>
          RKR Laundry provides fast, clean, and convenient laundry services in Enrile, Cagayan. 
          We offer professional wash, dry, and fold services with convenient pickup and delivery options. 
          Our affordable pricing starts at ₱180 per 7.5kg load. We are open Monday to Sunday, 7:30 AM to 7:30 PM. 
          Contact us at 09157079908, 09459787490, 09154354549, or 09288112476. 
          Visit our branch at 228 Divisoria Enrile Cagayan. 
          Online order tracking available. Special offers and promotions for loyal customers.
        </p>
        <p>
          Services include: Wash and fold, Dry cleaning, Pickup and delivery, Order tracking, 
          Customer support, Affordable pricing, Professional service, Fast turnaround.
        </p>
      </div>
    </>
  );
}

