import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useDataContext } from '../context/DataProvider';
import { AccountWithBalance } from '../types/account.types';
import { Pix } from '../types/transaction.types';
import { User } from '../types/user.types';
import { formatCentsAsCurrency, getRawCents } from '../utils/currencyUtils';
import Modal from './Common/Modal';

type SendPixModalProps = {
  isOpen: boolean;
  senderAccount: AccountWithBalance;
  allAccounts: AccountWithBalance[];
  onClose: () => void;
};

export default function SendPixModal({
  isOpen,
  senderAccount,
  allAccounts,
  onClose,
}: SendPixModalProps) {
  const [wasOpened, setWasOpened] = useState(false);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [pixReceiverUserId, setPixReceiverUserId] = useState<string | null>(
    null
  );

    const {transactionService, users, userService, refreshData} = useDataContext();

  const [otherUsers, setOtherUsers] = useState<User[]>(users.filter((u) => u.id !== senderAccount.userId));

  useEffect(() => {
    setOtherUsers(userService.listAll().filter((u) => u.id !== senderAccount.userId));
  }, [senderAccount.userId, userService]);

  useEffect(() => {
    if (wasOpened && !isOpen) {
      setAmount(0);
      setError('');

      if (otherUsers[0]) {
        setPixReceiverUserId(otherUsers[0].id);
      }
    }

    setWasOpened(isOpen);
  }, [isOpen, setAmount, setError, pixReceiverUserId, setPixReceiverUserId, otherUsers, wasOpened]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isNaN(amount) || amount <= 0) {
      setError('Informe um valor maior que zero.');
      return;
    }

    if (senderAccount.balance < amount) {
      setError('Saldo insuficiente para pix.');
      return;
    }

    if (!pixReceiverUserId) {
      setError('Selecione um destinatário.');
      return;
    }

    const receiverAccount = allAccounts.find(
      (acc) =>
        acc.userId === pixReceiverUserId && acc.type === 'CheckingAccount'
    );

    if (!receiverAccount) {
      setError('Conta corrente de destino não encontrada');
      return;
    }

    if (senderAccount.balance < amount) {
      setError('Saldo insuficiente para Pix.');
      return;
    }

    const pix: Pix = {
      id: crypto.randomUUID(),
      type: 'Pix',
      senderAccountId: senderAccount.id,
      receiverAccountId: receiverAccount.id,
      amount,
      createdAt: new Date().toISOString(),
      //comment: '',
    };

    transactionService.add(pix);
    refreshData();

    toast.success(
      `Pix de ${formatCentsAsCurrency(amount)} realizado com sucesso`
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
        <div className="relative">
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
          <span
            className='absolute font-semibold text-indigo-600 transform cursor-pointer right-3 bottom-2'
            onClick={() => setAmount(senderAccount.balance)}
          >
            MÁX
          </span>
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-slate-700">
            Destinatário
          </label>
          <select
            className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={pixReceiverUserId ?? ''}
            onChange={(e) => setPixReceiverUserId(e.target.value)}
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
