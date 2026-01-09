'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AdBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Hide ad container initially
    const adContainer = document.getElementById('ad-banner-container');
    if (adContainer) {
      adContainer.style.display = 'none';
      adContainer.style.height = '0';
      adContainer.style.width = '0';
      adContainer.style.position = 'fixed';
      adContainer.style.top = '-9999px';
      adContainer.style.left = '-9999px';
      adContainer.style.visibility = 'hidden';
    }

    // Check if desktop (min-width: 768px)
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);

    // Get header height
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) setHeaderHeight(header.offsetHeight);
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    // Check for collapsed state
    const adCollapsed = localStorage.getItem('ad-banner-collapsed');
    if (adCollapsed === 'true') setIsCollapsed(true);

    const checkForAds = () => {
      if (!isDesktop) {
        setIsVisible(false);
        return;
      }
      const container = document.getElementById('ad-banner-container');
      if (!container) {
        setIsVisible(false);
        return;
      }
      const ads = container.querySelectorAll('ins.adsbygoogle');
      const bodyAds = document.querySelectorAll('body > ins.adsbygoogle');
      let hasFilledAd = false;
      ads.forEach((ad) => {
        if (ad.getAttribute('data-ad-status') === 'filled') hasFilledAd = true;
      });
      bodyAds.forEach((ad) => {
        if (ad.getAttribute('data-ad-status') === 'filled') hasFilledAd = true;
      });
      setIsVisible(hasFilledAd && !isCollapsed);
    };

    checkForAds();

    const observer = new MutationObserver(() => checkForAds());
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-ad-status'] });
    if (adContainer) observer.observe(adContainer, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-ad-status'] });

    const containerCheck = setInterval(() => {
      const container = document.getElementById('ad-banner-container');
      if (container) {
        observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-ad-status'] });
        checkForAds();
        clearInterval(containerCheck);
      }
    }, 100);

    return () => {
      window.removeEventListener('resize', checkDesktop);
      window.removeEventListener('resize', updateHeaderHeight);
      observer.disconnect();
      clearInterval(containerCheck);
    };
  }, [isCollapsed, isDesktop]);

  const handleCollapse = () => {
    setIsCollapsed(true);
    setIsVisible(false);
    localStorage.setItem('ad-banner-collapsed', 'true');
  };

  const handleExpand = () => {
    setIsCollapsed(false);
    localStorage.removeItem('ad-banner-collapsed');
    const container = document.getElementById('ad-banner-container');
    if (container) {
      const ads = container.querySelectorAll('ins.adsbygoogle');
      ads.forEach((ad) => {
        if (ad.getAttribute('data-ad-status') === 'filled') setIsVisible(true);
      });
    }
  };

  if (!isDesktop) return null;

  if (!isVisible && isCollapsed) {
    return (
      <div
        className="fixed left-0 right-0 z-[999] bg-background/95 backdrop-blur-sm border-b"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="container mx-auto px-4 py-1 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExpand}
            className="h-6 px-2 text-xs"
            aria-label="Show ad banner"
          >
            <ChevronUp className="h-3 w-3 rotate-180" />
          </Button>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-[999] bg-background/95 backdrop-blur-sm border-b transition-all duration-300',
        isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
      )}
      style={{ top: `${headerHeight}px` }}
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="flex-1 flex justify-center min-h-[90px]">
          <div id="ad-banner-container" className="w-full" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCollapse}
          className="h-8 w-8 p-0 flex-shrink-0"
          aria-label="Collapse ad banner"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
