import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type ModalProps = {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ isOpen, title, children, onClose }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-md p-4 mx-4 bg-white shadow-lg rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          {title && (
            <h2 className="font-semibold text-md text-slate-900">{title}</h2>
          )}
          <button
            className="text-xs text-slate-400 hover:text-slate-600"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}