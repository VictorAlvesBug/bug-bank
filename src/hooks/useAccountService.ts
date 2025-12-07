import useLocalStorage from './useLocalStorage';
import { Account, AccountType } from '../types/account.types';
import { useCallback } from 'react';

export function useAccountsState():[
  Account[],
  React.Dispatch<React.SetStateAction<Account[]>>,
  Account
] {
    const cashAccount: Account = {
        id: 'cash-Cash',
        userId: 'cash',
        type: 'Cash',
        initialBalance: 10_000_00
    };
    const initialAccounts: Account[] = [cashAccount];

    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', initialAccounts)

    return [accounts, setAccounts, cashAccount];
}

export default function useAccountService() {
    const [accounts, setAccounts] = useAccountsState();

    const listAll = useCallback(() => accounts, [accounts]);

    const getById = useCallback((id: string) => accounts.find(account => account.id === id), [accounts]);

    const getByUserIdAndType = useCallback((userId: string, type: AccountType) =>
        accounts.find(account => account.userId === userId && account.type === type), [accounts]);

    const existsById = useCallback((id: string) => accounts.some(account => account.id === id), [accounts]);

    const save = useCallback((account: Account) => setAccounts(prev => [...prev, account]), [setAccounts]);

    return {
        listAll,
        getById,
        getByUserIdAndType,
        existsById,
        save
    }
}