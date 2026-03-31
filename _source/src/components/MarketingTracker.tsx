import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const MarketingTracker = () => {
  const { data: settings } = useQuery({
    queryKey: ["admin-marketing-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value")
        .in("key", ["google_analytics_id", "facebook_pixel_id"]);
      
      if (error) throw error;
      
      return data.reduce((acc: any, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {});
    },
  });

  useEffect(() => {
    if (!settings) return;

    // 1. Google Analytics (GTAG)
    if (settings.google_analytics_id && settings.google_analytics_id.trim() !== "") {
      const gaId = settings.google_analytics_id.trim();
      
      // Script tag
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      // Initialization
      const inlineScript = document.createElement("script");
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(inlineScript);
    }

    // 2. Facebook Pixel
    if (settings.facebook_pixel_id && settings.facebook_pixel_id.trim() !== "") {
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
        fbq('init', '${fbId}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);

      const fbNoScript = document.createElement("noscript");
      fbNoScript.innerHTML = `
        <img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=${fbId}&ev=PageView&noscript=1" />
      `;
      document.head.appendChild(fbNoScript);
    }
  }, [settings]);

  return null;
};

export default MarketingTracker;
