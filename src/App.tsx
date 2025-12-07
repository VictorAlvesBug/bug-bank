//import { Routes, Route, Link } from "react-router-dom";
import { useMemo, useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import {
  Account,
  AccountWithBalance,
  InvestmentOrCheckingAccountType,
} from './types/account.types';
import { User } from './types/user.types';
import { useUsersState } from './hooks/useUserService';
import { useAccountsState } from './hooks/useAccountService';
import { useTransactionsState } from './hooks/useTransactionService';
import { DepositOrWithdraw, Pix } from './types/transaction.types';

export default function App() {
  const [users, setUsers] = useUsersState();
  const [accounts, setAccounts, cashAccount] = useAccountsState();
  const [transactions, setTransactions] = useTransactionsState();

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  function calculateBalance(accountId: string): number{
    const account = accounts.find(acc => acc.id === accountId);

    if (!account) {
      alert(`Conta '${accountId}' não encontrada`);
      return 0;
    }

    const transactionsRelated = transactions.filter(tran => 
      [tran.senderAccountId, tran.receiverAccountId].includes(accountId)
    )

    return transactionsRelated.reduce((balance, tran) => {
      if (tran.receiverAccountId === accountId) 
        return balance + tran.amount;
      return balance - tran.amount;
    }, account.initialBalance)
  }

  const currentCheckingAccount = useMemo(
    () => {
      const account = accounts.find((a) => a.userId === currentUserId && a.type === "CheckingAccount")
      if (!account) 
        return null;

      const balance = calculateBalance(account.id);

      return {...account, balance} satisfies AccountWithBalance;
    },
    [accounts, currentUserId, calculateBalance]
  );

  const currentInvestmentAccount = useMemo(
    () => {
      const account = accounts.find((a) => a.userId === currentUserId && a.type === "ImmediateRescueInvestmentAccount")
      if (!account) 
        return null;

      const balance = calculateBalance(account.id);

      return {...account, balance} satisfies AccountWithBalance;
    },
    [accounts, currentUserId, calculateBalance]
  );

  function handleCreateUser(name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      alert("Informe o nome do usuário");
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

    const checkingAccount = accounts.find(
      (acc) => acc.userId === currentUserId && acc.type === 'CheckingAccount'
    );

    if (!checkingAccount) {
      alert('Conta corrente do usuário não encontrada');
      return;
    }

    const deposit: DepositOrWithdraw = {
      id: crypto.randomUUID(),
      type: 'Deposit',
      senderAccountId: cashAccount.id,
      receiverAccountId: checkingAccount.id,
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

    const checkingAccount = accounts.find(
      (acc) => acc.userId === currentUserId && acc.type === 'CheckingAccount'
    );

    if (!checkingAccount) {
      alert('Conta corrente do usuário não encontrada');
      return;
    }

    const balance = calculateBalance(checkingAccount.id);

    if (balance < amount) {
      alert('Saldo insuficiente para saque.');
      return;
    }

    const withdraw: DepositOrWithdraw = {
      id: crypto.randomUUID(),
      type: 'Withdraw',
      senderAccountId: checkingAccount.id,
      receiverAccountId: cashAccount.id,
      amount,
      createdAt: new Date().toISOString(),
    };
    
    setTransactions((prev) => [withdraw, ...prev]);
  }

  function handlePix(receiverUserId: string, amount: number, comment: string | undefined = undefined) {
    if (amount <= 0) {
      alert('Informe um valor válido para o Pix');
      return;
    }

    const senderAccount = accounts.find(
      (acc) => acc.userId === currentUserId && acc.type === 'CheckingAccount'
    );

    if (!senderAccount) {
      alert('Conta corrente de origem não encontrada');
      return;
    }

    const receiverAccount = accounts.find(
      (acc) => acc.userId === receiverUserId && acc.type === 'CheckingAccount'
    );

    if (!receiverAccount) {
      alert('Conta corrente de destino não encontrada');
      return;
    }

    const senderBalance = calculateBalance(senderAccount.id);

    if (senderBalance < amount) {
      alert('Saldo insuficiente para Pix.');
      return;
    }

    const pix: Pix = {
      id: crypto.randomUUID(),
      type: 'Pix',
      senderAccountId: senderAccount.id,
      receiverAccountId: receiverAccount.id,
      amount,
      createdAt: new Date().toISOString(),
      comment
    };
    setTransactions((prev) => [pix, ...prev]);
  }

  if (!currentUser || !currentCheckingAccount || !currentInvestmentAccount) {
    return (
      <Login
        users={users}
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
      allAccounts={accounts}
      transactions={transactions}
      onLogout={() => setCurrentUserId(null)}
      onDeposit={handleDeposit}
      onWithdraw={handleWithdraw}
      onPix={handlePix}
    />
  );
  /*return (
    <>
      <nav className="flex w-full bg-red-200">
        <Link to="/home">Home</Link> |{" "}
        <Link to="/">Login</Link>
      </nav>

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </>
  );*/
}
