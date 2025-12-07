import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import CheckingAccountCard from '../components/CheckingAccountCard';
import Button from '../components/Common/Button';
import InvestmentAccountCard from '../components/InvestmentAccountCard';
import MoneyModal from '../components/MoneyModal';
import TransactionCard from '../components/TransactionCard';
import { AccountWithBalance } from '../types/account.types';
import { MoneyActionMode, Transaction } from '../types/transaction.types';
import { User } from '../types/user.types';

type HomeProps = {
  user: User;
  checkingAccount: AccountWithBalance;
  investmentAccount: AccountWithBalance;
  allUsers: User[];
  allAccounts: AccountWithBalance[];
  transactions: Transaction[];
  onLogout: () => void;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onPix: (
    receiverUserId: string,
    amount: number,
    comment: string | undefined
  ) => void;
};

export default function Home({
  user,
  checkingAccount,
  investmentAccount,
  allUsers,
  allAccounts,
  transactions,
  onLogout,
  onDeposit,
  onWithdraw,
  onPix,
}: HomeProps) {
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [moneyModalMode, setMoneyModalMode] =
    useState<MoneyActionMode>('Deposit');
  const [pixReceiverUserId, setPixReceiverUserId] = useState<string | null>(
    null
  );

  const userAccountIds = useMemo(
    (): string[] => [checkingAccount.id, investmentAccount.id],
    [checkingAccount.id, investmentAccount.id]
  );

  const userTransactions = useMemo(
    () =>
      transactions.filter(
        (tran) =>
          userAccountIds.includes(tran.senderAccountId || '') ||
          userAccountIds.includes(tran.receiverAccountId)
      ),
    [transactions, userAccountIds]
  );

  const otherUsers = allUsers.filter((u) => u.id !== user.id);

  function openDeposit() {
    setMoneyModalMode('Deposit');
    setMoneyModalOpen(true);
  }

  function openWithdraw() {
    setMoneyModalMode('Withdraw');
    setMoneyModalOpen(true);
  }

  function openPix() {
    setMoneyModalMode('Pix');
    if (!pixReceiverUserId && otherUsers[0]) {
      setPixReceiverUserId(otherUsers[0].id);
    }
    setMoneyModalOpen(true);
  }

  function handleMoneyAction(amount: number, comment: string | undefined) {
    if (moneyModalMode === 'Deposit') {
      onDeposit(amount);
    } else if (moneyModalMode === 'Withdraw') {
      onWithdraw(amount);
    } else if (moneyModalMode === 'Pix') {
      if (!pixReceiverUserId) {
        alert('Selecione um destinatário.');
        return;
      }
      onPix(pixReceiverUserId, amount, comment);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <header className="flex items-center justify-between px-4 py-3 bg-white shadow">
        <div>
          <p className="text-xs text-slate-500">Olá,</p>
          <h1 className="text-lg font-semibold text-slate-900">{user.name}</h1>
        </div>
        <button
          className="px-3 py-1 text-xs text-red-500 border border-red-200 rounded-full hover:bg-red-50"
          onClick={onLogout}
        >
          <FontAwesomeIcon icon={faSignOut} />
        </button>
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* Saldo principal */}
        <section className="space-y-3">
          <CheckingAccountCard checkingAccount={checkingAccount} />
          <InvestmentAccountCard investmentAccount={investmentAccount} />
        </section>

        {/* Botões de ação */}
        <section className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={openDeposit}
              className="bg-emerald-500 hover:bg-emerald-400"
            >
              Depositar
            </Button>
            <Button
              onClick={openWithdraw}
              className="bg-rose-500 hover:bg-rose-400"
            >
              Sacar
            </Button>
            <Button
              onClick={openPix}
              className="bg-indigo-600 shadow rounded-xl hover:bg-indigo-500"
              disabled={otherUsers.length === 0}
            >
              Pix
            </Button>
          </div>
          {otherUsers.length === 0 && (
            <p className="text-[11px] text-slate-500">
              Cadastre mais usuários para poder enviar Pix.
            </p>
          )}
        </section>

        {/* Últimas transações */}
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-800">
            Últimas transações
          </h2>
          {userTransactions.length === 0 ? (
            <p className="text-xs text-slate-500">
              Nenhuma transação por enquanto. Faça um depósito, saque ou Pix.
            </p>
          ) : (
            <ul className="space-y-2">
              {userTransactions.slice(0, 10).map((transaction) => {
                return (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    allUsers={allUsers}
                    allAccounts={allAccounts}
                    checkingAccount={checkingAccount}
                  />
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* Modal compartilhado de dinheiro */}
      <MoneyModal
        isOpen={moneyModalOpen}
        mode={moneyModalMode}
        currentBalance={checkingAccount.balance}
        users={otherUsers}
        selectedPixReceiverUserId={pixReceiverUserId}
        onChangePixReceiverUser={setPixReceiverUserId}
        onConfirm={handleMoneyAction}
        onClose={() => setMoneyModalOpen(false)}
      />
    </div>
  );
}
