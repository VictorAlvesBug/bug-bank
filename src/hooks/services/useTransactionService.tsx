import useTransactionRepository from "../repositories/useTransactionRepository";

export default function useTransactionService() {
  const transactionRepository = useTransactionRepository();

  return transactionRepository;
}