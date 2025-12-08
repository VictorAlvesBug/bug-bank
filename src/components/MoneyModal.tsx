import { useEffect, useState } from 'react';
import { MoneyActionMode } from '../types/transaction.types';
import { User } from '../types/user.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type MoneyModalProps = {
  isOpen: boolean;
  mode: MoneyActionMode;
  checkingAccountBalance: number;
  investmentAccountBalance: number;
  users: User[];
  selectedPixReceiverUserId: string | null;
  onChangePixReceiverUser: (id: string | null) => void;
  onConfirm: (amount: number, comment: string | undefined) => void;
  onClose: () => void;
};

export default function MoneyModal({
  isOpen,
  mode,
  checkingAccountBalance,
  investmentAccountBalance,
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

  let title = '-';
  let description = '-';

  switch (mode) {
    case 'Deposit':
      title = 'Depósito';
      description = 'Quanto deseja depositar na conta?';
      break;

    case 'Withdraw':
      title = 'Saque';
      description = 'Quanto deseja sacar da conta?';
      break;

    case 'Pix':
      title = 'Pix';
      description = 'Informe o valor do Pix e selecione o destinatário.';
      break;

    case 'Investment':
      title = 'Investir';
      description = 'Quanto deseja investir?';
      break;

    case 'Rescue':
      title = 'Resgatar';
      description = 'Quanto deseja resgatar?';
      break;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(value) || value <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if ((mode === 'Withdraw' || mode === 'Pix' || mode === 'Investment') && value > checkingAccountBalance) {
      setError('Valor maior que o saldo em conta.');
      return;
    }
    if (mode === 'Rescue' && value > investmentAccountBalance) {
      setError('Valor maior que o saldo investido.');
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
      <p className={`text-xs text-slate-500 ${(mode === 'Investment' || mode === 'Rescue') ? '' : 'mb-3'}`}>
        Saldo em conta:{' '}
        <span className="font-semibold">
          {formatCentsAsCurrency(checkingAccountBalance)}
        </span>
      </p>
      {mode === 'Investment' || mode === 'Rescue' ? (
        <p className="mb-3 mt-[-3] text-xs text-slate-500">
          Saldo investido:{' '}
          <span className="font-semibold">
            {formatCentsAsCurrency(investmentAccountBalance)}
          </span>
        </p>
      ) : null}
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
            autoFocus
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
