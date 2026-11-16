import { AlertCircle } from "lucide-react";
import { ConfirmDialog } from "@/client/components/ConfirmDialog";
import { Alert, AlertDescription } from "@/client/components/ui/alert";

export function RemoveSavedKeywordsError({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function DeleteSavedKeywordsModal({
  selectedCount,
  isPending,
  onClose,
  onConfirm,
}: {
  selectedCount: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      title="Kelimeler silinsin mi?"
      confirmLabel={`${selectedCount} kelimeyi sil`}
      destructive
      pending={isPending}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      {selectedCount} kayıtlı kelime kalıcı olarak silinecek.
    </ConfirmDialog>
  );
}
