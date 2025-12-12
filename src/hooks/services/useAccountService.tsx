import { Account, AccountWithBalance } from '../../types/account.types';
import useAccountRepository from '../repositories/useAccountRepository';
import useTransactionRepository from '../repositories/useTransactionRepository';

export default function useAccountService() {
  const accountRepository = useAccountRepository();
  const transactionRepository = useTransactionRepository();

  function decorateWithBalance(
    account: Account | null
  ): AccountWithBalance | null {
    if (!account) return null;

    const transactions = transactionRepository.listByAccountIds([account.id]);
    const initialBalance = account.initialBalance || 0;
    const balance = transactions.reduce((balance, tran) => {
      if (tran.receiverAccountId === account.id) return balance + tran.amount;
      return balance - tran.amount;
    }, initialBalance);
    return { ...account, balance };
  }

  return {
    ...accountRepository,
    listAll: (): AccountWithBalance[] =>
      accountRepository
        .listAll()
        .map(decorateWithBalance)
        .filter(Boolean) as AccountWithBalance[],
    listByUserId: (userId: string): AccountWithBalance[] =>
      accountRepository
        .listByUserId(userId)
        .map(decorateWithBalance)
        .filter(Boolean) as AccountWithBalance[],
    listNonCashAccounts: (): AccountWithBalance[] =>
      accountRepository
        .listNonCashAccounts()
        .map(decorateWithBalance)
        .filter(Boolean) as AccountWithBalance[],
    getCashAccount: (): AccountWithBalance | null =>
      decorateWithBalance(accountRepository.getCashAccount()),
    getById: (id: string | null): AccountWithBalance | null =>
      decorateWithBalance(accountRepository.getById(id)),
    getByUserIdAndType: (
      userId: string,
      type: Account['type']
    ): AccountWithBalance | null =>
      decorateWithBalance(accountRepository.getByUserIdAndType(userId, type)),
  };
}
