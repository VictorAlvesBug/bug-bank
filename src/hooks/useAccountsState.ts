import { Dispatch, SetStateAction } from 'react';
import { Account } from '../types/account.types';
import useLocalStorage from './useLocalStorage';

export default function useAccountsState(): [
    Account[],
    Dispatch<SetStateAction<Account[]>>,
    () => void
]{
    const cashAccount: Account = {
        id: 'cash-Cash',
        userId: 'cash',
        type: 'Cash',
        initialBalance: 10_000_00
    }
    
    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', [cashAccount]);

    const resetAccounts = () => setAccounts(prev => [...prev.filter(acc => acc.id === cashAccount.id)]);

    return [accounts, setAccounts, resetAccounts];
}