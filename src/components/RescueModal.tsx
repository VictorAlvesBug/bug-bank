import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useTransactionService from '../hooks/services/useTransactionService';
import { AccountWithBalance } from '../types/account.types';
import { Rescue } from '../types/transaction.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type RescueModalProps = {
  isOpen: boolean;
  investmentAccount: AccountWithBalance;
  checkingAccount: AccountWithBalance;
  onClose: () => void;
};

export default function RescueModal({
  isOpen,
  investmentAccount,
  checkingAccount,
  onClose,
}: RescueModalProps) {
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const transactionService = useTransactionService();

  useEffect(() => {
    setAmount(0);
    setError('');
  }, [isOpen, setAmount, setError]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isNaN(amount) || amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    if (amount > investmentAccount.balance) {
      setError('Saldo investido insuficiente para resgate.');
      return;
    }

    const rescue: Rescue = {
      id: crypto.randomUUID(),
      type: 'Rescue',
      senderAccountId: investmentAccount.id,
      receiverAccountId: checkingAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };

    console.log(rescue);

    transactionService.add(rescue);

    toast.success(
      `Resgate de ${formatCentsAsCurrency(amount)} realizado com sucesso`
    );

    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Resgate'}>
      <p className="mb-2 text-xs text-slate-500">
        Quanto deseja resgatar do seu investimento?
      </p>
      <p className={`mb-3 text-xs text-slate-500`}>
        Saldo investido:{' '}
        <span className="font-semibold">
          {formatCentsAsCurrency(investmentAccount.balance)}
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
            value={formatCentsAsCurrency(amount)}
            onChange={(e) => {
              setAmount(getRawCents(e.target.value));
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
