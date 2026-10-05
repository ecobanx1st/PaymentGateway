"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import PageLoader from "@/components/ui/PageLoader";

function NavigationLoader() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const displayStartTime = useRef(0);
  const fadeOutTimer = useRef(null);
  const removeTimer = useRef(null);
  const fallbackTimer = useRef(null);
  const prevRoute = useRef(null);

  useEffect(() => {
    const currentRoute = pathname + "?" + searchParams.toString();
    
    // Only fade out if we are currently showing, and the route HAS changed
    if (show && prevRoute.current !== currentRoute && prevRoute.current !== null) {
      const elapsed = Date.now() - displayStartTime.current;
      const minVisibleTime = 600;
      const delay = Math.max(0, minVisibleTime - elapsed);

      clearTimeout(fadeOutTimer.current);
      clearTimeout(removeTimer.current);
      clearTimeout(fallbackTimer.current);

      fadeOutTimer.current = setTimeout(() => {
        const loaderEl = document.getElementById("global-page-loader-wrapper");
        if (loaderEl) {
          loaderEl.style.opacity = "0";
        }
        
        removeTimer.current = setTimeout(() => {
          setShow(false);
        }, 400); 
      }, delay);
    }
    
    prevRoute.current = currentRoute;
  }, [pathname, searchParams, show]);

  useEffect(() => {
    const handleStart = () => {
      setTimeout(() => {
        clearTimeout(fadeOutTimer.current);
        clearTimeout(removeTimer.current);
        clearTimeout(fallbackTimer.current);
        
        const loaderEl = document.getElementById("global-page-loader-wrapper");
        if (loaderEl) {
          loaderEl.style.opacity = "1";
        }

        displayStartTime.current = Date.now();
        setShow(true);

        fallbackTimer.current = setTimeout(() => {
          const loaderEl = document.getElementById("global-page-loader-wrapper");
          if (loaderEl) {
            loaderEl.style.opacity = "0";
            removeTimer.current = setTimeout(() => {
              setShow(false);
            }, 400);
          }
        }, 2000);
      }, 0);
    };

    const handleAnchorClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;
      
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || target.target === "_blank" || target.hasAttribute("download")) return;
      
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      
      try {
        const targetUrl = new URL(href, window.location.href);
        if (targetUrl.origin !== window.location.origin) return;
        if (targetUrl.pathname === window.location.pathname && targetUrl.search === window.location.search) return;
        
        handleStart();
      } catch (err) {}
    };

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      handleStart();
      return originalPushState.apply(this, args);
    };
    
    const originalReplaceState = window.history.replaceState;
    window.history.replaceState = function(...args) {
        handleStart();
        return originalReplaceState.apply(this, args);
    };

    document.addEventListener("click", handleAnchorClick, true);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      clearTimeout(fallbackTimer.current);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      id="global-page-loader-wrapper"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        pointerEvents: 'none',
        opacity: 1,
        transition: 'opacity 400ms ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <PageLoader />
    </div>
  );
}

export default function PageTransition() {
  return (
    <Suspense fallback={null}>
      <NavigationLoader />
    </Suspense>
  );
}
