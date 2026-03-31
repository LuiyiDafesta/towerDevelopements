import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const MarketingTracker = () => {
  const location = useLocation();

  const { data: settings } = useQuery({
    queryKey: ["admin-marketing-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["google_analytics_id", "facebook_pixel_id", "visitor_tracking_code"]);
      
      if (error) throw error;
      
      return data.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
    },
  });

  // 1. Initial Script Injection
  useEffect(() => {
    if (!settings) return;

    // Google Analytics
    if (settings.google_analytics_id && settings.google_analytics_id.trim() !== "" && !window.gtag) {
      const gaId = settings.google_analytics_id.trim();
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement("script");
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(inlineScript);
    }

    // Facebook Pixel
    if (settings.facebook_pixel_id && settings.facebook_pixel_id.trim() !== "" && !window.fbq) {
      const fbId = settings.facebook_pixel_id.trim();
      const fbScript = document.createElement("script");
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        window.fbq = fbq;
        fbq('init', '${fbId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // 3. Visitor Tracking (Improved Injection for raw HTML/Scripts)
    if (settings.visitor_tracking_code && settings.visitor_tracking_code.trim() !== "") {
      const vtCode = settings.visitor_tracking_code.trim();
      
      // If code contains script tags, we parse them and inject them properly
      if (vtCode.includes("<script")) {
        const div = document.createElement("div");
        div.innerHTML = vtCode;
        const scripts = Array.from(div.querySelectorAll("script"));
        
        scripts.forEach((oldScript) => {
          const newScript = document.createElement("script");
          // Copy all attributes (src, async, defer, etc)
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          // Copy content
          newScript.innerHTML = oldScript.innerHTML;
          document.head.appendChild(newScript);
        });
      } else {
        const vtScript = document.createElement("script");
        vtScript.innerHTML = vtCode;
        document.head.appendChild(vtScript);
      }
    }
  }, [settings]);

  // 2. Route Change Tracking
  useEffect(() => {
    if (!settings) return;

    const url = window.location.origin + location.pathname + location.search;

    if (window.gtag && settings.google_analytics_id) {
      window.gtag('config', settings.google_analytics_id, {
        page_location: url,
        page_path: location.pathname,
        page_title: document.title,
      });
    }

    if (window.fbq && settings.facebook_pixel_id) {
      window.fbq('track', 'PageView');
    }
  }, [location, settings]);

  return null;
};

export default MarketingTracker;
