import { Transaction } from '../../types/transaction.types';
import useLocalStorage from '../useLocalStorage';

export default function useTransactionRepository() {
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);

    return {
        listAll: () => transactions,
        listByAccountIds: (accountIds: string[]) =>
            transactions.filter(
                (tran) =>
                    accountIds.includes(tran.senderAccountId || '') ||
                    accountIds.includes(tran.receiverAccountId)
            ),
        add: (transaction: Transaction) => setTransactions((prev) => [transaction, ...prev]),
        update: (updatedTransaction: Transaction) => setTransactions((prev) =>
            prev.map((tran) =>
                tran.id === updatedTransaction.id ? updatedTransaction : tran
            )),
        reset: () => setTransactions([])
    };
} 