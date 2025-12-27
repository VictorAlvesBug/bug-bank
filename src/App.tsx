import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import createAccountService from './services/accountService';
import useIsInvestmentEnabledState from './hooks/useIsInvestmentEnabledState';
import createTransactionService from './services/transactionService';
import createUserService from './services/userService';
import Home from './pages/Home';
import Login from './pages/Login';
import { AccountWithBalance } from './types/account.types';
import { Transaction, Yield } from './types/transaction.types';
import localStorageUtils from './utils/useLocalStorageUtils';

export default function App() {
  const userService = createUserService();
  const accountService = createAccountService();
  const transactionService = createTransactionService();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { get: getIsInvestmentEnabled, set: setIsInvestmentEnabled } =
    localStorageUtils<boolean>('isInvestmentEnabled', false);
  const [isInvestmentEnabledState, setIsInvestmentEnabledState] =
    useState<boolean>(getIsInvestmentEnabled());

  var onToggleInvestmentEnabled = useCallback(() => {
    setIsInvestmentEnabled(!isInvestmentEnabledState);
    setIsInvestmentEnabledState(!isInvestmentEnabledState);

    if (isInvestmentEnabledState === false) {
      toast.success(`Recurso de investimento habilitado`);
      return;
    }

    toast.success(`Recurso de investimento desabilitado`);
  }, [setIsInvestmentEnabled, isInvestmentEnabledState]);

  const currentUser = useMemo(
    () => userService.getById(currentUserId),
    [userService, currentUserId]
  );

  const accountsWithBalance = useMemo((): AccountWithBalance[] => {
    return accountService.listAll().map((account) => {
      const transactionsRelated = transactionService.listByAccountIds([
        account.id,
      ]);

      const balance = transactionsRelated.reduce((balance, tran) => {
        if (tran.receiverAccountId === account.id) return balance + tran.amount;
        return balance - tran.amount;
      }, account.initialBalance);

      return { ...account, balance };
    });
  }, [accountService, transactionService]);

  const cashAccount = useMemo(
    () => accountsWithBalance.find((acc) => acc.type === 'Cash'),
    [accountsWithBalance]
  );

  const nonCashAccounts = useMemo(
    () => accountsWithBalance.filter((acc) => acc.type !== 'Cash'),
    [accountsWithBalance]
  );

  const currentCheckingAccount = useMemo(
    () =>
      nonCashAccounts.find(
        (a) => a.userId === currentUserId && a.type === 'CheckingAccount'
      ),
    [nonCashAccounts, currentUserId]
  );

  const currentInvestmentAccount = useMemo(
    () =>
      nonCashAccounts.find(
        (a) =>
          a.userId === currentUserId &&
          a.type === 'ImmediateRescueInvestmentAccount'
      ),
    [nonCashAccounts, currentUserId]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const investmentAccounts = nonCashAccounts.filter(
        (account) =>
          account.type === 'ImmediateRescueInvestmentAccount' &&
          account.balance > 0
      );

      investmentAccounts.forEach((investmentAccount) => {
        const yieldRateInAHour = 0.5;
        const initialYield: Yield = {
          id: crypto.randomUUID(),
          type: 'Yield',
          receiverAccountId: investmentAccount.id,
          amount: 0,
          createdAt: new Date().toISOString(),
        };

        const nonYieldTransactionDates = transactionService
          .listAll()
          .filter(
            (tran) =>
              tran.receiverAccountId === investmentAccount.id &&
              tran.type !== 'Yield'
          )
          .map((tran) => new Date(tran.createdAt));

        const lastNotYieldTransactionDate = nonYieldTransactionDates.reduce(
          (max, curr) => (curr > max ? curr : max),
          new Date(1970, 0, 1)
        );

        let tranList = transactionService
          .listAll()
          .filter((tran) => tran.receiverAccountId === investmentAccount.id);
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
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [nonCashAccounts, transactionService]);
  if (!cashAccount) {
    toast.error('Conta de dinheiro físico não encontrada');
    return null;
  }

  const toastContainer = (
    <ToastContainer
      position="bottom-right"
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

  if (!currentUser || !currentCheckingAccount || !currentInvestmentAccount) {
    return (
      <>
        {toastContainer}
        <Login
          cashAccount={cashAccount}
          accounts={nonCashAccounts}
          isInvestmentEnabled={getIsInvestmentEnabled()}
          onToggleInvestmentEnabled={onToggleInvestmentEnabled}
          onSelectUser={setCurrentUserId}
        />
      </>
    );
  }

  return (
    <>
      {toastContainer}
      <Home
        user={currentUser}
        cashAccount={cashAccount}
        checkingAccount={currentCheckingAccount}
        investmentAccount={currentInvestmentAccount}
        allAccounts={nonCashAccounts}
        isInvestmentEnabled={getIsInvestmentEnabled()}
        onLogout={() => setCurrentUserId(null)}
      />
    </>
  );
}
