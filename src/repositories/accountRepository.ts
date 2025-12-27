import { Account } from '../types/account.types';
import localStorageUtils from '../utils/useLocalStorageUtils';

const createAccountRepository = (() => {
    const initialCashAccount: Account = {
        id: 'cash-Cash',
        userId: 'cash',
        type: 'Cash',
        initialBalance: 10_000_00
    }

    const { get, set } = localStorageUtils<Account[]>('accounts', [initialCashAccount]);

    const listAll = () => get();
    const listByUserId = (userId: string) => get().filter((account) => account.userId === userId);
    const listNonCashAccounts = () => get().filter((account) => account.type !== 'Cash');
    const getCashAccount = () => get().find((account) => account.type === 'Cash') || initialCashAccount;
    const getById = (id: string | null) => get().find((account) => account.id === id) || null;
    const getByUserIdAndType = (userId: string, type: Account['type']) =>
        get().find((account) => account.userId === userId && account.type === type) || null;
    const add = (account: Account) => set([...get(), account]);
    const update = (updatedAccount: Account) => set(get().map((account) =>
        account.id === updatedAccount.id ? updatedAccount : account
    ));
    const reset = () => set(get().filter(acc => acc.id === initialCashAccount.id));

    return () => {
        return {
            listAll,
            listByUserId,
            listNonCashAccounts,
            getCashAccount,
            getById,
            getByUserIdAndType,
            add,
            update,
            reset
        };
    }
})();

export default createAccountRepository;