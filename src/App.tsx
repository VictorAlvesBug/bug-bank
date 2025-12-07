import { useMemo, useState } from 'react';
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
import { DepositOrWithdraw, Pix } from './types/transaction.types';
import { User } from './types/user.types';

export default function App() {
  const [users, setUsers] = useUsersState();
  const [accounts, setAccounts] = useAccountsState();
  const [transactions, setTransactions] = useTransactionsState();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  if (!cashAccount) {
    alert('Conta de dinheiro físico não encontrada');
    return null;
  }

  function handleCreateUser(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      alert('Informe o nome do usuário');
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: trimmed,
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
  }

  function handleDeposit(amount: number) {
    if (amount <= 0) {
      alert('Informe um valor válido para o depósito');
      return;
    }

    if (!currentCheckingAccount) {
      alert('Conta corrente do usuário não encontrada');
      return;
    }

    if (!cashAccount) {
      alert('Conta de dinhero físico não encontrada');
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
      alert('Informe um valor válido para o saque');
      return;
    }

    if (!currentCheckingAccount) {
      alert('Conta corrente do usuário não encontrada');
      return;
    }

    if (!cashAccount) {
      alert('Conta de dinhero físico não encontrada');
      return;
    }

    if (currentCheckingAccount.balance < amount) {
      alert('Saldo insuficiente para saque.');
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
      alert('Informe um valor válido para o Pix');
      return;
    }

    if (!currentCheckingAccount) {
      alert('Conta corrente de origem não encontrada');
      return;
    }

    const receiverAccount = nonCashAccounts.find(
      (acc) => acc.userId === receiverUserId && acc.type === 'CheckingAccount'
    );

    if (!receiverAccount) {
      alert('Conta corrente de destino não encontrada');
      return;
    }

    if (currentCheckingAccount.balance < amount) {
      alert('Saldo insuficiente para Pix.');
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

  if (!currentUser || !currentCheckingAccount || !currentInvestmentAccount) {
    return (
      <Login
        cashAccount={cashAccount}
        users={users}
        accounts={nonCashAccounts}
        onSelectUser={setCurrentUserId}
        onCreateUser={handleCreateUser}
      />
    );
  }

  return (
    <Home
      user={currentUser}
      checkingAccount={currentCheckingAccount}
      investmentAccount={currentInvestmentAccount}
      allUsers={users}
      allAccounts={nonCashAccounts}
      transactions={transactions}
      onLogout={() => setCurrentUserId(null)}
      onDeposit={handleDeposit}
      onWithdraw={handleWithdraw}
      onPix={handlePix}
    />
  );
}
