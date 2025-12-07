import React from 'react';
import { Transaction, TransactionType } from '../types/transaction.types';
import { AccountWithBalance } from '../types/account.types';
import { formatDate } from '../utils/dateUtils';
import { formatCentsAsCurrency } from '../utils/currencyUtils';
import { User } from '../types/user.types';

type TransactionCardProps = {
  transaction: Transaction;
  checkingAccount: AccountWithBalance;
  allUsers: User[];
  allAccounts: AccountWithBalance[];
};

export default function TransactionCard({
  transaction,
  checkingAccount,
  allUsers,
  allAccounts,
}: TransactionCardProps) {
  const outTransactionTypes: TransactionType[] = ['Withdraw', 'Investment'];

  const isPixOut =
    transaction.type === 'Pix' &&
    transaction.senderAccountId === checkingAccount.id;

  const isOut = isPixOut || outTransactionTypes.includes(transaction.type);
  const sign = isOut ? '-' : '+';

  function resolveUserName(id?: string) {
    if (!id) return '—';
    return allUsers.find((u) => u.id === id)?.name ?? `Usuário ${id}`;
  }

  function transactionLabel(transaction: Transaction) {
    switch (transaction.type) {
      case 'Deposit':
        return 'Depósito na sua conta';

      case 'Withdraw':
        return 'Saque da sua conta';

      case 'Pix':
        const senderAccount = allAccounts.find(
          (acc) => acc.id === transaction.senderAccountId
        );
        const receiverAccount = allAccounts.find(
          (acc) => acc.id === transaction.receiverAccountId
        );
        const senderName = resolveUserName(senderAccount?.userId);
        const receiverName = resolveUserName(receiverAccount?.userId);

        if (checkingAccount.id === transaction.senderAccountId) {
          return `Pix enviado para ${receiverName}`;
        }
        if (checkingAccount.id === transaction.receiverAccountId) {
          return `Pix recebido de ${senderName}`;
        }
        return `Pix entre ${senderName} e ${receiverName}`;

      case 'Investment':
        return 'Dinheiro investido';

      case 'Rescue':
        return 'Dinheiro resgatado';

      case 'Yield':
        return 'Rendimento';

      default:
        return 'Transação';
    }
  }

  function transactionType(transactionType: TransactionType) {
    switch (transactionType) {
      case 'Deposit':
        return 'Depósito';

      case 'Withdraw':
        return 'Saque';

      case 'Pix':
        return 'Pix';

      case 'Investment':
        return 'Dinheiro investido';

      case 'Rescue':
        return 'Dinheiro resgatado';

      case 'Yield':
        return 'Rendimento';

      default:
        return 'Transação';
    }
  }

  return (
    <li
      key={transaction.id}
      className="flex items-center justify-between p-3 bg-white border shadow-sm rounded-xl border-slate-100"
    >
      <div>
        <p className="text-sm font-medium text-slate-800">
          {transactionLabel(transaction)}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {formatDate(transaction.createdAt)}
        </p>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-semibold ${
            isOut ? 'text-rose-500' : 'text-emerald-500'
          }`}
        >
          {sign} {formatCentsAsCurrency(transaction.amount)}
        </p>
        <p className="text-[10px] text-slate-400">
          {transactionType(transaction.type).toUpperCase()}
        </p>
      </div>
    </li>
  );
}
