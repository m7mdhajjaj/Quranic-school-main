import { useState, useEffect } from "react";
import { getLogo } from "@/Api/uploadApi";

export const useLogo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    const fetchLogo = async () => {
      setLogoLoading(true);
      try {
        const data = await getLogo();
        if (data.success && data.url) {
          setLogoUrl(data.url);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogo();
  }, []);

  return { logoUrl, logoLoading };
};
