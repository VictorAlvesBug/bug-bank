import useLocalStorage from './useLocalStorage';
import { Transaction } from '../types/transaction.types';
import { Account } from '../types/account.types';
import { useCallback } from 'react';

export const useTransactionsState = () => useLocalStorage<Transaction[]>('transactions', [])

export default function useTransactionService() {
    const [transactions, setTransactions] = useTransactionsState();

    const listAll = useCallback(() => transactions, [transactions]);

    const listByAccountId = useCallback((accountId: string) => transactions
        .filter(({ senderAccountId, receiverAccountId }) =>
            [senderAccountId, receiverAccountId].includes(accountId)), [transactions]);

    const getBalance = useCallback((account: Account) => listByAccountId(account.id)
        .reduce((accBalance, transaction) => {
            if (account.id === transaction.senderAccountId)
                return accBalance - transaction.amount;

            if (account.id === transaction.receiverAccountId)
                return accBalance + transaction.amount;

            return accBalance;
        }, account.initialBalance), [listByAccountId]);

    const getById = useCallback((id: string) => transactions.find(transaction => transaction.id === id), [transactions]);

    const save = useCallback((transaction: Transaction) => setTransactions(prev => [...prev, transaction]), [setTransactions]);

    return {
        listAll,
        listByAccountId,
        getBalance,
        getById,
        save,
    }
}