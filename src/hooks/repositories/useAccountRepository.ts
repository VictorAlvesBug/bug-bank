import { Account } from '../../types/account.types';
import useLocalStorage from '../useLocalStorage';

export default function useAccountRepository() {
    const initialCashAccount: Account = {
        id: 'cash-Cash',
        userId: 'cash',
        type: 'Cash',
        initialBalance: 10_000_00
    }

    const [accounts, setAccounts] = useLocalStorage<Account[]>('accounts', [initialCashAccount]);

    return {
        listAll: () => accounts,
        listByUserId: (userId: string) => accounts.filter((account) => account.userId === userId),
        listNonCashAccounts: () => accounts.filter((account) => account.type !== 'Cash'),
        getCashAccount: () => accounts.find((account) => account.type === 'Cash') || initialCashAccount,
        getById: (id: string | null) => accounts.find((account) => account.id === id) || null,
        getByUserIdAndType: (userId: string, type: Account['type']) =>
            accounts.find((account) => account.userId === userId && account.type === type) || null,
        add: (account: Account) => setAccounts((prev) => [...prev, account]),
        update: (updatedAccount: Account) => setAccounts((prev) =>
            prev.map((account) =>
                account.id === updatedAccount.id ? updatedAccount : account
            )
        ),
        reset: () => setAccounts(prev => [...prev.filter(acc => acc.id === initialCashAccount.id)])
    };
}