import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<{ error: string | null }>;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Excluir",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setLoading(false);
      setError(null);
    }
  }

  if (!open) return null;

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    const result = await onConfirm();
    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }
    setLoading(false);
    onCancel();
  }

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{description}</p>
        {error && <p className="text-sm text-pink">{error}</p>}
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleConfirm} disabled={loading}>
            {loading ? "Excluindo..." : confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
