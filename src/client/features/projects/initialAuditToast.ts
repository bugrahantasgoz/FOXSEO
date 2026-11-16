import { toast } from "sonner";
import { getStandardErrorMessage } from "@/client/lib/error-messages";

/** Tells the user whether saving a website started its first site scan. */
export function toastInitialAudit(
  initialAudit:
    | { status: "started" | "pending" }
    | { status: "unavailable"; code: string }
    | null,
) {
  if (initialAudit?.status === "unavailable")
    toast.warning("Site kaydedildi. İlk tarama başlatılamadı.", {
      description: getStandardErrorMessage(new Error(initialAudit.code)),
    });
  else if (initialAudit?.status === "started")
    toast.success("50 sayfalık site taraman başladı");
}
