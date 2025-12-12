import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useAccountService from '../hooks/services/useAccountService';
import { AccountWithBalance, Cash } from '../types/account.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type CashAmountModalProps = {
  isOpen: boolean;
  cashAccount: AccountWithBalance;
  onClose: () => void;
};

export default function CashAmountModal({
  isOpen,
  cashAccount,
  onClose,
}: CashAmountModalProps) {
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const accountService = useAccountService();

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

    if (!cashAccount) {
      setError('Conta de dinheiro físico não encontrada');
      return;
    }
    if (amount <= 0 || amount < cashAccount.initialBalance - cashAccount.balance) {
      setError('Informe uma quantia superior ao total em conta dos usuários');
      return;
    }

    const {balance, ...newCashAccount} = cashAccount as {
      balance: number;
    } & Cash;

    newCashAccount.initialBalance = amount;

    accountService.update(newCashAccount);

    toast.success(`Valor total em dinheiro redefinido para ${formatCentsAsCurrency(amount)}`);

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
