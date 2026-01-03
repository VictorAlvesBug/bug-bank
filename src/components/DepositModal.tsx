import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDataContext } from '../context/DataProvider';
import { AccountWithBalance } from '../types/account.types';
import { DepositOrWithdraw } from '../types/transaction.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type DepositModalProps = {
  isOpen: boolean;
  cashAccount: AccountWithBalance;
  checkingAccount: AccountWithBalance;
  onClose: () => void;
};

export default function DepositModal({
  isOpen,
  cashAccount,
  checkingAccount,
  onClose,
}: DepositModalProps) {
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  const {transactionService, refreshData} = useDataContext();

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

    if (amount > cashAccount.balance) {
      setError('Dinheiro em espécie insuficiente para depósito');
      return;
    }

    const deposit: DepositOrWithdraw = {
      id: crypto.randomUUID(),
      type: 'Deposit',
      senderAccountId: cashAccount.id,
      receiverAccountId: checkingAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };

    transactionService.add(deposit);
    refreshData();

    toast.success(
      `Depósito de ${formatCentsAsCurrency(amount)} realizado com sucesso`
    );

    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Depósito'}>
      <p className="mb-2 text-xs text-slate-500">
        Quanto deseja depositar na sua conta?
      </p>
      <p className={`mb-3 text-xs text-slate-500`}>
        Dinheiro em espécie:{' '}
        <span className="font-semibold">
          {formatCentsAsCurrency(cashAccount.balance)}
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
