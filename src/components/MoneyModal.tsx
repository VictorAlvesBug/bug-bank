import { useEffect, useState } from 'react';
import { MoneyActionMode } from '../types/transaction.types';
import { User } from '../types/user.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type MoneyModalProps = {
  isOpen: boolean;
  mode: MoneyActionMode;
  currentBalance: number;
  users: User[];
  selectedPixReceiverUserId: string | null;
  onChangePixReceiverUser: (id: string | null) => void;
  onConfirm: (amount: number, comment: string | undefined) => void;
  onClose: () => void;
};

export default function MoneyModal({
  isOpen,
  mode,
  currentBalance,
  users,
  selectedPixReceiverUserId,
  onChangePixReceiverUser,
  onConfirm,
  onClose,
}: MoneyModalProps) {
  const [value, setValue] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    setValue(0);
    setError('');
  }, [mode, setValue, setError]);

  if (!isOpen) return null;

  const title =
    mode === 'Deposit'
      ? 'Depósito'
      : mode === 'Withdraw'
      ? 'Saque'
      : mode === 'Pix'
      ? 'Pix'
      : '';

  const description =
    mode === 'Deposit'
      ? 'Informe o valor que deseja depositar na conta.'
      : mode === 'Withdraw'
      ? 'Informe o valor que deseja sacar da conta.'
      : 'Informe o valor do Pix e selecione o destinatário.';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(value) || value <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if ((mode === 'Withdraw' || mode === 'Pix') && value > currentBalance) {
      setError('Valor maior que o saldo disponível.');
      return;
    }
    if (mode === 'Pix' && !selectedPixReceiverUserId) {
      setError('Selecione um destinatário.');
      return;
    }

    onConfirm(value, '');
    setValue(0);
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-2 text-xs text-slate-500">{description}</p>
      <p className="mb-3 text-xs text-slate-500">
        Saldo em conta:{' '}
        <span className="font-semibold">
          {formatCentsAsCurrency(currentBalance)}
        </span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block mb-1 text-xs font-medium text-slate-700">
            Valor
          </label>
          <input
            type="string"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formatCentsAsCurrency(value)}
            onChange={(e) => {
              setValue(getRawCents(e.target.value));
              setError('');
            }}
          />
        </div>

        {mode === 'Pix' && (
          <div>
            <label className="block mb-1 text-xs font-medium text-slate-700">
              Destinatário
            </label>
            <select
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedPixReceiverUserId ?? ''}
              onChange={(e) =>
                onChangePixReceiverUser(
                  e.target.value ? String(e.target.value) : null
                )
              }
            >
              <option value="">Selecione um usuário</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-xs text-red-500">{error}</p>}

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
