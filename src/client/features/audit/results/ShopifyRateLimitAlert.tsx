import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/client/components/ui/alert";
import { Button } from "@/client/components/ui/button";

/**
 * Shown when Shopify rate limited an unrendered crawl that carried a crawler
 * signature. Shopify's edge can still throttle Cloudflare Workers then, and a
 * rendered audit reads throttled pages from outside Cloudflare.
 */
export function ShopifyRateLimitAlert({
  projectId,
  startUrl,
}: {
  projectId: string;
  startUrl: string;
}) {
  return (
    <Alert variant="warning">
      <ShieldAlert />
      <AlertTitle>
        Shopify alan adınla ilgili bir hatayla karşılaştık.
      </AlertTitle>
      <AlertDescription>
        Shopify genel olarak istekleri sınırlıyor, bu yüzden bu rapor eksik.
        Denetimi tamamlamak için "JavaScript'i işle" açık yeni bir denetim
        başlat.
      </AlertDescription>
      <div className="col-start-2 mt-2">
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={
            <Link
              to="/p/$projectId/audit"
              params={{ projectId }}
              search={{ url: startUrl }}
            />
          }
        >
          Yeni denetim başlat
        </Button>
      </div>
    </Alert>
  );
}
