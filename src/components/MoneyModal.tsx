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
  onConfirm: (amount: number, comment: string | undefined) => void;
  onClose: () => void;
};

export default function MoneyModal({
  isOpen,
  mode,
  checkingAccountBalance,
  investmentAccountBalance,
  users,
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
    case 'Investment':
      title = 'Investir';
      description = 'Quanto deseja investir?';
      break;

    case 'Rescue':
      title = 'Resgatar';
      description = 'Quanto deseja resgatar?';
      break;

    case 'ChangeCashValue':
      title = 'Alterar valor do dinheiro em espécie';
      description = 'Quanto dinheiro em cédulas você possui?';
      break;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isNaN(value) || value <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }
    if (
      (mode === 'Investment') &&
      value > checkingAccountBalance
    ) {
      setError('Valor maior que o saldo em conta.');
      return;
    }
    if (mode === 'Rescue' && value > investmentAccountBalance) {
      setError('Valor maior que o saldo investido.');
      return;
    }

    onConfirm(value, '');
    setValue(0);
    setError('');
    onClose();
  }

  const checkingAccountBalanceAllowedModes: MoneyActionMode[] = [
    'Investment',
  ];

  const investmentAccountBalanceAllowedModes: MoneyActionMode[] = [
    'Rescue',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="mb-2 text-xs text-slate-500">{description}</p>
      <p className={`mb-3 text-xs text-slate-500`}>
        {checkingAccountBalanceAllowedModes.includes(mode) ? (
          <>
            Saldo em conta:{' '}
            <span className="font-semibold">
              {formatCentsAsCurrency(checkingAccountBalance)}
            </span>
          </>
        ) : null}
      </p>
      {investmentAccountBalanceAllowedModes.includes(mode) ? (
        <>
          Saldo investido:{' '}
          <span className="font-semibold">
            {formatCentsAsCurrency(investmentAccountBalance)}
          </span>
        </>
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
