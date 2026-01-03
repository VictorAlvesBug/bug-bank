import React, { createContext, useCallback, useContext, useState } from 'react';
import useAccountsState from '../hooks/useAccountsState';
import useTransactionsState from '../hooks/useTransactionsState';
import useUsersState from '../hooks/useUsersState';
import { AccountWithBalance } from '../types/account.types';
import { Transaction } from '../types/transaction.types';
import { User } from '../types/user.types';


 type ExtractService<T, K extends string> = T extends Record<K, infer U> ? U : never;

type DataContextValue = {
  users: User[],
  userService: ExtractService<ReturnType<typeof useUsersState>, 'userService'>;
  accounts: AccountWithBalance[],
  accountService: ExtractService<ReturnType<typeof useAccountsState>, 'accountService'>;
  transactions: Transaction[],
  transactionService: ExtractService<ReturnType<typeof useTransactionsState>, 'transactionService'>;
  refreshData: () => void;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

type DataProviderProps = {
    children: React.ReactNode;
};

export default function DataProvider({ children }: DataProviderProps) {
    const { users: usersFromState, userService } = useUsersState();
    const { accounts: accountsFromState, accountService } = useAccountsState();
    const { transactions: transactionsFromState, transactionService } = useTransactionsState();

    const [users, setUsers] = useState<User[]>(usersFromState);
    const [accounts, setAccounts] = useState<AccountWithBalance[]>(accountsFromState);
    const [transactions, setTransactions] = useState<Transaction[]>(transactionsFromState);


    const refreshData = useCallback(() => {
        setUsers(userService.listAll());
        setAccounts(accountService.listAll());
        setTransactions(transactionService.listAll());
    }, [accountService, transactionService, userService]);

    const value: DataContextValue = {
        users,
        userService,
        accounts,
        accountService,
        transactions,
        transactionService,
        refreshData
    };

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useDataContext() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useDataContext must be used within a DataProvider");
    }
    return context;
}