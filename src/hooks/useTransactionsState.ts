import { Dispatch, SetStateAction } from 'react';
import { Transaction } from '../types/transaction.types';
import useLocalStorage from './useLocalStorage';

export default function useTransactionsState(): [
    Transaction[],
    Dispatch<SetStateAction<Transaction[]>>,
    () => void
]{
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
    
    const resetTransactions = () => setTransactions([]);

    return [transactions, setTransactions, resetTransactions];
} 