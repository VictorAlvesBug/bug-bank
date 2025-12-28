import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import CheckingAccountCard from '../components/CheckingAccountCard';
import Button from '../components/Common/Button';
import DepositModal from '../components/DepositModal';
import InvestmentAccountCard from '../components/InvestmentAccountCard';
import InvestmentModal from '../components/InvestmentModal';
import RescueModal from '../components/RescueModal';
import SendPixModal from '../components/SendPixModal';
import TransactionCard from '../components/TransactionCard';
import WithdrawModal from '../components/WithdrawModal';
import useTransactionsState from '../hooks/useTransactionsState';
import useUsersState from '../hooks/useUsersState';
import { AccountWithBalance } from '../types/account.types';
import { Transaction } from '../types/transaction.types';
import { User } from '../types/user.types';

type HomeProps = {
  user: User;
  cashAccount: AccountWithBalance;
  checkingAccount: AccountWithBalance;
  investmentAccount: AccountWithBalance;
  allAccounts: AccountWithBalance[];
  isInvestmentEnabled: boolean;
  onLogout: () => void;
};

export default function Home({
  user,
  cashAccount,
  checkingAccount,
  investmentAccount,
  allAccounts,
  isInvestmentEnabled,
  onLogout,
}: HomeProps) {
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [sendPixModalOpen, setSendPixModalOpen] = useState(false);
  const [investmentModalOpen, setInvestmentModalOpen] = useState(false);
  const [rescueModalOpen, setRescueModalOpen] = useState(false);

  const {transactionService} = useTransactionsState();
  const { users } = useUsersState();
  const [userAccountIds, setUserAccountIds] = useState<string[]>([]);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setUserAccountIds([checkingAccount.id, investmentAccount.id]);
  }, [checkingAccount.id, investmentAccount.id]);

  useEffect(() => {
    setUserTransactions(transactionService.listByAccountIds(userAccountIds));
  }, [transactionService, userAccountIds]);

  const otherUsers = users.filter((u) => u.id !== user.id);

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
              onInvestmentOpen={() => setInvestmentModalOpen(true)}
              onRescueOpen={() => setRescueModalOpen(true)}
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
                    allUsers={users}
                    allAccounts={allAccounts}
                    checkingAccount={checkingAccount}
                  />
                );
              })}
            </ul>
          )}
        </section>
      </main>

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
        allAccounts={allAccounts}
        onClose={() => setSendPixModalOpen(false)}
      />
      <InvestmentModal
        isOpen={investmentModalOpen}
        checkingAccount={checkingAccount}
        investmentAccount={investmentAccount}
        onClose={() => setInvestmentModalOpen(false)}
      />
      <RescueModal
        isOpen={rescueModalOpen}
        checkingAccount={checkingAccount}
        investmentAccount={investmentAccount}
        onClose={() => setRescueModalOpen(false)}
      />
    </div>
  );
}
