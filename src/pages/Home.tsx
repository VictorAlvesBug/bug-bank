import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import CheckingAccountCard from '../components/CheckingAccountCard';
import Button from '../components/Common/Button';
import InvestmentAccountCard from '../components/InvestmentAccountCard';
import MoneyModal from '../components/MoneyModal';
import TransactionCard from '../components/TransactionCard';
import { AccountWithBalance } from '../types/account.types';
import { MoneyActionMode, Transaction } from '../types/transaction.types';
import { User } from '../types/user.types';
import { toast } from 'react-toastify';
import DepositModal from '../components/DepositModal';
import WithdrawModal from '../components/WithdrawModal';
import SendPixModal from '../components/SendPixModal';

type HomeProps = {
  user: User;
  cashAccount: AccountWithBalance;
  checkingAccount: AccountWithBalance;
  investmentAccount: AccountWithBalance;
  allUsers: User[];
  allAccounts: AccountWithBalance[];
  transactions: Transaction[];
  setTransactions: Dispatch<SetStateAction<Transaction[]>>;
  isInvestmentEnabled: boolean;
  onLogout: () => void;
  onInvest: (amount: number) => void;
  onRescue: (amount: number) => void;
};

export default function Home({
  user,
  cashAccount,
  checkingAccount,
  investmentAccount,
  allUsers,
  allAccounts,
  transactions,
  isInvestmentEnabled,
  onLogout,
  onInvest,
  onRescue
}: HomeProps) {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [sendPixModalOpen, setSendPixModalOpen] = useState(false);
  

  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [moneyModalMode, setMoneyModalMode] =
    useState<MoneyActionMode>('Deposit');

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

  function openInvest() {
    setMoneyModalMode('Investment');
    setMoneyModalOpen(true);
  }

  function openRescue() {
    setMoneyModalMode('Rescue');
    setMoneyModalOpen(true);
  }

  function handleMoneyAction(amount: number, comment: string | undefined) {
    switch (moneyModalMode) {
      case 'Investment':
        onInvest(amount);
        break;

      case 'Rescue':
        onRescue(amount);
        break;
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
          {isInvestmentEnabled && (
            <InvestmentAccountCard
              investmentAccount={investmentAccount}
              onInvestOpen={openInvest}
              onRescueOpen={openRescue}
            />
          )}
        </section>

        {/* Botões de ação */}
        <section className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={() => setDepositModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-400"
            >
              Depositar
            </Button>
            <Button
              onClick={() => setWithdrawModalOpen(true)}
              className="bg-rose-500 hover:bg-rose-400"
            >
              Sacar
            </Button>
            <Button
              onClick={() => setSendPixModalOpen(true)}
              className="bg-indigo-600 shadow rounded-xl hover:bg-indigo-500"
              disabled={otherUsers.length === 0}
            >
              Enviar PIX
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
        checkingAccountBalance={checkingAccount.balance}
        investmentAccountBalance={investmentAccount.balance}
        users={otherUsers}
        onConfirm={handleMoneyAction}
        onClose={() => setMoneyModalOpen(false)}
      />
      <DepositModal
        isOpen={depositModalOpen}
        cashAccount={cashAccount}
        checkingAccount={checkingAccount}
        onClose={() => setDepositModalOpen(false)}
      />
      <WithdrawModal
        isOpen={withdrawModalOpen}
        cashAccount={cashAccount}
        checkingAccount={checkingAccount}
        onClose={() => setWithdrawModalOpen(false)}
      />
      <SendPixModal
        isOpen={sendPixModalOpen}
        senderAccount={checkingAccount}
        otherUsers={allUsers.filter(u => u.id !== user.id)}
        allAccounts={allAccounts}
        onClose={() => setSendPixModalOpen(false)}
      />
    </div>
  );
}
