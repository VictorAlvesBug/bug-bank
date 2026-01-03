import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDataContext } from '../context/DataProvider';
import { AccountWithBalance } from '../types/account.types';
import { DepositOrWithdraw } from '../types/transaction.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type WithdrawModalProps = {
  isOpen: boolean;
  cashAccount: AccountWithBalance;
  checkingAccount: AccountWithBalance;
  onClose: () => void;
};

export default function WithdrawModal({
  isOpen,
  cashAccount,
  checkingAccount,
  onClose,
}: WithdrawModalProps) {
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

    if (checkingAccount.balance < amount) {
      setError('Saldo insuficiente para saque.');
      return;
    }

    const withdraw: DepositOrWithdraw = {
      id: crypto.randomUUID(),
      type: 'Withdraw',
      senderAccountId: checkingAccount.id,
      receiverAccountId: cashAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };

    transactionService.add(withdraw);
    refreshData();

    toast.success(`Saque de ${formatCentsAsCurrency(amount)} realizado com sucesso`);

    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Saque'}>
      <p className="mb-2 text-xs text-slate-500">
        Quanto deseja sacar da sua conta?
      </p>
      <p className={`mb-3 text-xs text-slate-500`}>
        Saldo em conta:{' '}
        <span className="font-semibold">
          {formatCentsAsCurrency(checkingAccount.balance)}
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
