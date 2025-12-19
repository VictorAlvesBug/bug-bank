import useTransactionRepository from "../repositories/transactionRepository";

export default function useTransactionService() {
  const transactionRepository = useTransactionRepository();

  return transactionRepository;
}