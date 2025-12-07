import { Transaction } from '../types/transaction.types';
import useLocalStorage from './useLocalStorage';

export default function useTransactionsState() {
    return useLocalStorage<Transaction[]>('transactions', [])
} 