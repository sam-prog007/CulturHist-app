import { useEffect } from "react";

interface AdSenseProps {
  slot: string;
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  responsive?: boolean;
  className?: string;
}

const AdSense = ({ 
  slot, 
  format = "auto", 
  responsive = true,
  className = ""
}: AdSenseProps) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};

export default AdSense;
