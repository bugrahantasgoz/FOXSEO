import type { KeywordIntent } from "@/types/keywords";
import { Badge } from "@/client/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";

const VARIANTS: Record<
  KeywordIntent,
  "info" | "warning" | "success" | "soft" | "secondary"
> = {
  informational: "info",
  commercial: "warning",
  transactional: "success",
  navigational: "soft",
  unknown: "secondary",
};

const SHORT_LABELS: Record<KeywordIntent, string> = {
  informational: "Bilgi",
  commercial: "Ticari",
  transactional: "İşlem",
  navigational: "Yön",
  unknown: "?",
};

/** Full intent labels, shared with the keyword filters so both stay in sync. */
export const INTENT_LABELS: Record<KeywordIntent, string> = {
  informational: "Bilgi amaçlı",
  commercial: "Ticari araştırma",
  transactional: "İşlem amaçlı",
  navigational: "Yönlendirme amaçlı",
  unknown: "Bilinmiyor",
};

const DESCRIPTIONS: Record<
  KeywordIntent,
  { label: string; description: string }
> = {
  informational: {
    label: INTENT_LABELS.informational,
    description:
      "Arayan kişi bilgi ya da cevap istiyor. Eğitici içerikler, rehberler ve açıklayıcı yazılar için uygun.",
  },
  commercial: {
    label: INTENT_LABELS.commercial,
    description:
      "Arayan kişi satın almadan önce seçenekleri araştırıyor. Karşılaştırmalar, alternatifler ve ürün odaklı sayfalar için uygun.",
  },
  transactional: {
    label: INTENT_LABELS.transactional,
    description:
      "Arayan kişi bir işlem yapmaya, genelde satın almaya hazır. Net teklifler, fiyatlar, denemeler ve dönüşüm adımlarına öncelik ver.",
  },
  navigational: {
    label: INTENT_LABELS.navigational,
    description:
      "Arayan kişi belirli bir siteyi, markayı ya da sayfayı arıyor. Bu aramalarda genelde beklenen sayfaya ulaştırmak kazandırır.",
  },
  unknown: {
    label: INTENT_LABELS.unknown,
    description:
      "Bu kelimenin arama amacı bilinmiyor; içerik kararlarını sadece bu etikete göre verme.",
  },
};

export function IntentBadge({ intent }: { intent: KeywordIntent }) {
  const details = DESCRIPTIONS[intent];

  return (
    <Tooltip>
      <TooltipTrigger
        delay={0}
        render={
          <Badge
            variant={VARIANTS[intent]}
            tabIndex={0}
            className="h-6 min-w-11 cursor-help font-semibold"
          />
        }
        aria-label={`Arama amacı: ${details.label}`}
      >
        {SHORT_LABELS[intent]}
      </TooltipTrigger>
      <TooltipContent className="flex-col items-start gap-1">
        <span className="font-semibold">{details.label}</span>
        <span>{details.description}</span>
      </TooltipContent>
    </Tooltip>
  );
}
