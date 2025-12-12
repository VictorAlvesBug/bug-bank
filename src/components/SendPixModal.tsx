import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useTransactionsState from '../hooks/useTransactionsState';
import { AccountWithBalance } from '../types/account.types';
import { Pix } from '../types/transaction.types';
import { User } from '../types/user.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type SendPixModalProps = {
  isOpen: boolean;
  senderAccount: AccountWithBalance;
  otherUsers: User[];
  allAccounts: AccountWithBalance[];
  onClose: () => void;
};

export default function SendPixModal({
  isOpen,
  senderAccount,
  otherUsers,
  allAccounts,
  onClose,
}: SendPixModalProps) {
  const [value, setValue] = useState(0);
  const [error, setError] = useState('');
  const [pixReceiverUserId, setPixReceiverUserId] = useState<string | null>(
    null
  );
  const setTransactions = useTransactionsState()[1];

  useEffect(() => {
    setValue(0);
    setError('');

    if (!pixReceiverUserId && otherUsers[0]) {
      setPixReceiverUserId(otherUsers[0].id);
    }
  }, [isOpen, setValue, setError, pixReceiverUserId, setPixReceiverUserId, otherUsers]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isNaN(value) || value <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    if (senderAccount.balance < value) {
      setError('Saldo insuficiente para pix.');
      return;
    }

    if (!pixReceiverUserId) {
      setError('Selecione um destinatário.');
      return;
    }

    const receiverAccount = allAccounts.find(
      (acc) => acc.userId === pixReceiverUserId && acc.type === 'CheckingAccount'
    );

    if (!receiverAccount) {
      setError('Conta corrente de destino não encontrada');
      return;
    }

    if (senderAccount.balance < value) {
      setError('Saldo insuficiente para Pix.');
      return;
    }

    const pix: Pix = {
      id: crypto.randomUUID(),
      type: 'Pix',
      senderAccountId: senderAccount.id,
      receiverAccountId: receiverAccount.id,
      amount: value,
      createdAt: new Date().toISOString(),
      //comment: '',
    };

    setTransactions((prev) => [pix, ...prev]);

    toast.success(
      `Pix de ${formatCentsAsCurrency(value)} realizado com sucesso`
    );

    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={'Enviar PIX'}>
      <p className="mb-2 text-xs text-slate-500">
        Informe o valor do Pix e selecione o destinatário.
      </p>
      <p className={`mb-3 text-xs text-slate-500`}>
        Saldo em conta:{' '}
        <span className="font-semibold">
          {formatCentsAsCurrency(senderAccount.balance)}
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
            autoFocus
          />
        </div>

            <div>
            <label className="block mb-1 text-xs font-medium text-slate-700">
              Destinatário
            </label>
            <select
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={pixReceiverUserId ?? ''}
              onChange={(e) =>
                setPixReceiverUserId(e.target.value)
              }
            >
              <option value="">Selecione um usuário</option>
              {otherUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
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
