import { Account } from '../types/account.types';
import useLocalStorage from './useLocalStorage';

export default function useAccountsState(){
    const cashAccount: Account = {
        id: 'cash-Cash',
        userId: 'cash',
        type: 'Cash',
        initialBalance: 10_000_00
    };
    const initialAccounts: Account[] = [cashAccount];

    return useLocalStorage<Account[]>('accounts', initialAccounts)
}