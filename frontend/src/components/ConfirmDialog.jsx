import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmDialog({
  open,
  title = 'Confirm action',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onCancel}
      footer={[
        <Button key="cancel" variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>,
        <Button key="confirm" variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Working...' : confirmLabel}
        </Button>,
      ]}
    >
      <p className="text-sm leading-6 text-mist-600">{description}</p>
    </Modal>
  );
}
