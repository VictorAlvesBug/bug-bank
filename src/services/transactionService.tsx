import createTransactionRepository from "../repositories/transactionRepository";

export default function createTransactionService() {
  const instance = createTransactionRepository();

  return instance;
}