import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAccountsState from './hooks/useAccountsState';
import useTransactionsState from './hooks/useTransactionsState';
import useUsersState from './hooks/useUsersState';
import Home from './pages/Home';
import Login from './pages/Login';
import {
  Account,
  AccountWithBalance,
  InvestmentOrCheckingAccountType,
} from './types/account.types';
import {
  DepositOrWithdraw,
  Investment,
  Pix,
  Rescue,
  Transaction,
  Yield,
} from './types/transaction.types';
import { User } from './types/user.types';
import { toast, ToastContainer } from 'react-toastify';
import useIsInvestmentEnabledState from './hooks/useIsInvestmentEnabledState';

export default function App() {
  const [users, setUsers, resetUsers] = useUsersState();
  const [accounts, setAccounts, resetAccounts] = useAccountsState();
  const [transactions, setTransactions, resetTransactions] =
    useTransactionsState();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isInvestmentEnabled, setIsInvestmentEnabled] =
    useIsInvestmentEnabledState();

  var onChangeInvestmentEnabled = useCallback(
    (enabled: boolean) => {
      setIsInvestmentEnabled(enabled);

      if (enabled) {
        toast.success(`Recurso de investimento habilitado`);
        return;
      }

      toast.success(`Recurso de investimento desabilitado`);
    },
    [setIsInvestmentEnabled]
  );

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const accountsWithBalance = useMemo((): AccountWithBalance[] => {
    return accounts.map((account) => {
      const transactionsRelated = transactions.filter((tran) =>
        [tran.senderAccountId, tran.receiverAccountId].includes(account.id)
      );

      const balance = transactionsRelated.reduce((balance, tran) => {
        if (tran.receiverAccountId === account.id) return balance + tran.amount;
        return balance - tran.amount;
      }, account.initialBalance);

      return { ...account, balance };
    });
  }, [accounts, transactions]);

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

        const nonYieldTransactionDates = transactions
          .filter(
            (tran) =>
              tran.receiverAccountId === investmentAccount.id &&
              tran.type !== 'Yield'
          )
          .map((tran) => new Date(tran.createdAt));

        const lastNotYieldTransactionDate = nonYieldTransactionDates.reduce(
          (max, curr) => (curr > max ? curr : max)
        );

        let tranList = transactions.filter(
          (tran) => tran.receiverAccountId === investmentAccount.id
        );
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

        setTransactions((prev) => [
          lastYield,
          ...prev.filter((tran) => tran.id !== lastYield.id),
        ]);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [nonCashAccounts, setTransactions, transactions]);

  if (!cashAccount) {
    toast.error('Conta de dinheiro físico não encontrada');
    return null;
  }

  function handleCreateUser(name: string) {
    name = name.trim();
    if (!name) {
      toast.error('Informe o nome do usuário');
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
    };

    setUsers((prev) => [...prev, newUser]);

    setAccounts((prev) => {
      const newAccounts = (
        [
          'CheckingAccount',
          'ImmediateRescueInvestmentAccount',
        ] satisfies InvestmentOrCheckingAccountType[]
      ).map<Account>(
        (accountType) =>
          ({
            id: `${newUser.id}-${accountType}`,
            userId: newUser.id,
            type: accountType satisfies InvestmentOrCheckingAccountType,
            initialBalance: 0,
          } satisfies Account)
      );
      return [...prev, ...newAccounts];
    });

    toast.success(`Seja bem-vindo, ${name}!`);
  }

  function handleDeposit(amount: number) {
    if (amount <= 0) {
      toast.error('Informe um valor válido para o depósito');
      return;
    }

    if (!currentCheckingAccount) {
      toast.error('Conta corrente do usuário não encontrada');
      return;
    }

    if (!cashAccount) {
      toast.error('Conta de dinhero físico não encontrada');
      return;
    }

    const deposit: DepositOrWithdraw = {
      id: crypto.randomUUID(),
      type: 'Deposit',
      senderAccountId: cashAccount.id,
      receiverAccountId: currentCheckingAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [deposit, ...prev]);
  }

  function handleWithdraw(amount: number) {
    if (amount <= 0) {
      toast.error('Informe um valor válido para o saque');
      return;
    }

    if (!currentCheckingAccount) {
      toast.error('Conta corrente do usuário não encontrada');
      return;
    }

    if (!cashAccount) {
      toast.error('Conta de dinhero físico não encontrada');
      return;
    }

    if (currentCheckingAccount.balance < amount) {
      toast.error('Saldo insuficiente para saque.');
      return;
    }

    const withdraw: DepositOrWithdraw = {
      id: crypto.randomUUID(),
      type: 'Withdraw',
      senderAccountId: currentCheckingAccount.id,
      receiverAccountId: cashAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [withdraw, ...prev]);
  }

  function handlePix(
    receiverUserId: string,
    amount: number,
    comment: string | undefined = undefined
  ) {
    if (amount <= 0) {
      toast.error('Informe um valor válido para o Pix');
      return;
    }

    if (!currentCheckingAccount) {
      toast.error('Conta corrente de origem não encontrada');
      return;
    }

    const receiverAccount = nonCashAccounts.find(
      (acc) => acc.userId === receiverUserId && acc.type === 'CheckingAccount'
    );

    if (!receiverAccount) {
      toast.error('Conta corrente de destino não encontrada');
      return;
    }

    if (currentCheckingAccount.balance < amount) {
      toast.error('Saldo insuficiente para Pix.');
      return;
    }

    const pix: Pix = {
      id: crypto.randomUUID(),
      type: 'Pix',
      senderAccountId: currentCheckingAccount.id,
      receiverAccountId: receiverAccount.id,
      amount,
      createdAt: new Date().toISOString(),
      comment,
    };
    setTransactions((prev) => [pix, ...prev]);
  }

  function handleInvest(amount: number) {
    if (amount <= 0) {
      toast.error('Informe um valor válido para o investimento');
      return;
    }

    if (!currentCheckingAccount) {
      toast.error('Conta corrente do usuário não encontrada');
      return;
    }

    if (!currentInvestmentAccount) {
      toast.error('Conta de investimento do usuário não encontrada');
      return;
    }

    if (currentCheckingAccount.balance < amount) {
      toast.error('Saldo insuficiente para investimento.');
      return;
    }

    const investment: Investment = {
      id: crypto.randomUUID(),
      type: 'Investment',
      senderAccountId: currentCheckingAccount.id,
      receiverAccountId: currentInvestmentAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [investment, ...prev]);
  }

  function handleRescue(amount: number) {
    if (amount <= 0) {
      toast.error('Informe um valor válido para o resgate');
      return;
    }

    if (!currentCheckingAccount) {
      toast.error('Conta corrente do usuário não encontrada');
      return;
    }

    if (!currentInvestmentAccount) {
      toast.error('Conta de investimento do usuário não encontrada');
      return;
    }

    if (currentInvestmentAccount.balance < amount) {
      toast.error('Saldo insuficiente para resgate.');
      return;
    }

    const rescue: Rescue = {
      id: crypto.randomUUID(),
      type: 'Rescue',
      senderAccountId: currentInvestmentAccount.id,
      receiverAccountId: currentCheckingAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };

    setTransactions((prev) => [rescue, ...prev]);
  }

  function handleResetApp() {
    resetUsers();
    resetAccounts();
    resetTransactions();

    toast.success(`Os dados do aplicativo foram limpos`);
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
          users={users}
          accounts={nonCashAccounts}
          isInvestmentEnabled={isInvestmentEnabled}
          onChangeInvestmentEnabled={onChangeInvestmentEnabled}
          onResetApp={handleResetApp}
          onSelectUser={setCurrentUserId}
          onCreateUser={handleCreateUser}
        />
      </>
    );
  }

  return (
    <>
      {toastContainer}
      <Home
        user={currentUser}
        checkingAccount={currentCheckingAccount}
        investmentAccount={currentInvestmentAccount}
        allUsers={users}
        allAccounts={nonCashAccounts}
        transactions={transactions}
        isInvestmentEnabled={isInvestmentEnabled}
        onLogout={() => setCurrentUserId(null)}
        onDeposit={handleDeposit}
        onWithdraw={handleWithdraw}
        onPix={handlePix}
        onInvest={handleInvest}
        onRescue={handleRescue}
      />
    </>
  );
}
