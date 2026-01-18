import createTransactionRepository from '../repositories/transactionRepository';
import { Transaction } from '../types/transaction.types';

export default function createTransactionService() {
  const instance = createTransactionRepository();

  const save = (transaction: Transaction) => {
    if (instance.listAll().some((tran) => tran.id === transaction.id)) {
      instance.update(transaction);
    } else {
      instance.add(transaction);
    }
  };

  return {
    ...instance,
    save,
  };
}
