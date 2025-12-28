import { Transaction } from '../types/transaction.types';
import localStorageUtils from '../utils/localStorageUtils';

const createTransactionRepository = (() => {
    const { get, set } = localStorageUtils<Transaction[]>('transactions', []);

    const listAll = () => get();
    const listByAccountIds = (accountIds: string[]) =>
        get().filter(
            (tran) =>
                accountIds.includes(tran.senderAccountId || '') ||
                accountIds.includes(tran.receiverAccountId)
        );
    const add = (transaction: Transaction) => set([...get(), transaction]);
    const update = (updatedTransaction: Transaction) => set(get().map((tran) =>
        tran.id === updatedTransaction.id ? updatedTransaction : tran
    ));
    const reset = () => set([]);

    return () => {
        return {
            listAll,
            listByAccountIds,
            add,
            update,
            reset
        }
    };
})();

export default createTransactionRepository;