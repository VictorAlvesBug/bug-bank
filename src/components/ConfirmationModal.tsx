import Modal from './Common/Modal';

type ConfirmationModalProps = {
  isOpen: boolean;
  text: string;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmationModal({
  isOpen,
  text,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const handleOnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Confirmação'}>
      <p className="mb-2 text-xs text-slate-500">
        {text}
      </p>
      <form
        onSubmit={handleOnSubmit}
        className="space-y-3"
      >
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
          >
            Confirmar
          </button>
        </div>
      </form>
    </Modal>
  );
}
