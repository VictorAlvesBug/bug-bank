import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import useAccountsState from './hooks/useAccountsState';
import useIsInvestmentEnabledState from './hooks/useIsInvestmentEnabledState';
import useTransactionsState from './hooks/useTransactionsState';
import useUsersState from './hooks/useUsersState';
import Home from './pages/Home';
import Login from './pages/Login';
import { AccountWithBalance } from './types/account.types';
import { Transaction, Yield } from './types/transaction.types';
import { User } from './types/user.types';

export default function App() {
  const {userService} = useUsersState();
  const {accounts} = useAccountsState();
  const {transactions, transactionService, refreshTransactions} = useTransactionsState();

  const [currentUserIdState, setCurrentUserId] = useState<string | null>(null);
  const [isInvestmentEnabledState, toggleInvestmentEnabled] =
    useIsInvestmentEnabledState();

  const [currentUserState, setCurrentUser] = useState<User | null>(null);

  const [cashAccountState, setCashAccount] =
    useState<AccountWithBalance | null>(null);
  const [nonCashAccountsState, setNonCashAccounts] = useState<
    AccountWithBalance[]
  >([]);
  const [currentCheckingAccountState, setCurrentCheckingAccount] =
    useState<AccountWithBalance | null>(null);
  const [currentInvestmentAccountState, setCurrentInvestmentAccount] =
    useState<AccountWithBalance | null>(null);
  const [investmentAccountsState, setInvestmentAccounts] = useState<
    AccountWithBalance[]
  >([]);

  useEffect(() => {
    const currentUser = userService.getById(currentUserIdState);
    setCurrentUser(currentUser || null);
  }, [currentUserIdState, userService]);

  useEffect(() => {
    const accountsWithBalance = accounts.map((account) => {
      const relatedTransactions = transactionService.listByAccountIds([
        account.id,
      ]);

      const balance = relatedTransactions.reduce((balance, tran) => {
        if (tran.receiverAccountId === account.id) return balance + tran.amount;
        return balance - tran.amount;
      }, account.initialBalance);

      return { ...account, balance };
    });

    const cashAccount = accountsWithBalance.find((acc) => acc.type === 'Cash');

    const nonCashAccounts = accountsWithBalance.filter(
      (acc) => acc.type !== 'Cash'
    );

    const currentCheckingAccount = nonCashAccounts.find(
      (a) => a.userId === currentUserIdState && a.type === 'CheckingAccount'
    );

    const currentInvestmentAccount = nonCashAccounts.find(
      (a) =>
        a.userId === currentUserIdState &&
        a.type === 'ImmediateRescueInvestmentAccount'
    );

    const investmentAccounts = nonCashAccounts.filter(
      (account) =>
        account.type === 'ImmediateRescueInvestmentAccount' &&
        account.balance > 0
    );

    setCashAccount(cashAccount || null);
    setNonCashAccounts(nonCashAccounts);
    setCurrentCheckingAccount(currentCheckingAccount || null);
    setCurrentInvestmentAccount(currentInvestmentAccount || null);
    setInvestmentAccounts(investmentAccounts);
  }, [accounts, transactionService, currentUserIdState, userService]);

  useEffect(() => {
    const interval = setInterval(() => {
      investmentAccountsState.forEach((investmentAccount) => {
        const yieldRateInAHour = 0.5;
        const initialYield: Yield = {
          id: crypto.randomUUID(),
          type: 'Yield',
          receiverAccountId: investmentAccount.id,
          amount: 0,
          createdAt: new Date().toISOString(),
        };

        const nonYieldTransactionDates = transactions.filter(
            (tran) =>
              tran.receiverAccountId === investmentAccount.id &&
              tran.type !== 'Yield'
          )
          .map((tran) => new Date(tran.createdAt));

        const lastNotYieldTransactionDate = nonYieldTransactionDates.reduce(
          (max, curr) => (curr > max ? curr : max),
          new Date(1970, 0, 1)
        );

        let tranList = transactions.filter((tran) => tran.receiverAccountId === investmentAccount.id);
        tranList.sort(
          (tranA: Transaction, tranB: Transaction) =>
            new Date(tranA.createdAt).getTime() -
            new Date(tranB.createdAt).getTime()
        );

        const lastTransaction = tranList.at(-1);
        const lastYield =
          lastTransaction?.type === 'Yield' ? lastTransaction : initialYield;
        lastYield.createdAt = initialYield.createdAt;

        const lastYieldDate = new Date(lastYield.createdAt);
        const diffInHours =
          (lastYieldDate.getTime() - lastNotYieldTransactionDate.getTime()) /
          (1000 * 60 * 60);

        const investmentBalanceWithoutLastYield =
          investmentAccount.balance - lastYield.amount;
        lastYield.amount =
          investmentBalanceWithoutLastYield *
          (Math.pow(1 + yieldRateInAHour, diffInHours) - 1);

        lastYield.amount = Math.floor(
          lastYield.amount /*- (lastYield.amount % 100)*/
        );

        transactionService.update(lastYield);
        refreshTransactions();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [investmentAccountsState, transactionService, transactions, refreshTransactions]);

  if (!cashAccountState) {
    toast.error('Conta de dinheiro físico não encontrada');
    return null;
  }

  const toastContainer = (
    <ToastContainer
      position="bottom-left"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
  );

  if (
    !currentUserState ||
    !currentCheckingAccountState ||
    !currentInvestmentAccountState
  ) {
    return (
      <>
        {toastContainer}
        <Login
          cashAccount={cashAccountState}
          accounts={nonCashAccountsState}
          isInvestmentEnabled={isInvestmentEnabledState}
          onToggleInvestmentEnabled={toggleInvestmentEnabled}
          onSelectUser={setCurrentUserId}
        />
      </>
    );
  }

  return (
    <>
      {toastContainer}
      <Home
        user={currentUserState}
        cashAccount={cashAccountState}
        checkingAccount={currentCheckingAccountState}
        investmentAccount={currentInvestmentAccountState}
        allAccounts={nonCashAccountsState}
        isInvestmentEnabled={isInvestmentEnabledState}
        onLogout={() => setCurrentUserId(null)}
      />
    </>
  );
}
