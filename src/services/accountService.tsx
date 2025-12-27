import { Account, AccountWithBalance } from '../types/account.types';
import createAccountRepository from '../repositories/accountRepository';
import createTransactionRepository from '../repositories/transactionRepository';

export default function createAccountService() {
  const accountInstance = createAccountRepository();
  const transactionInstance = createTransactionRepository();
  function decorateWithBalance(
    account: Account | null
  ): AccountWithBalance | null {
    if (!account) return null;

    const transactions = transactionInstance.listByAccountIds([account.id]);
    const initialBalance = account.initialBalance || 0;
    const balance = transactions.reduce((balance, tran) => {
      if (tran.receiverAccountId === account.id) return balance + tran.amount;
      return balance - tran.amount;
    }, initialBalance);
    return { ...account, balance };
  }

  return {
    ...accountInstance,
    listAll: (): AccountWithBalance[] =>
      accountInstance
        .listAll()
        .map(decorateWithBalance)
        .filter(Boolean) as AccountWithBalance[],
    listByUserId: (userId: string): AccountWithBalance[] =>
      accountInstance
        .listByUserId(userId)
        .map(decorateWithBalance)
        .filter(Boolean) as AccountWithBalance[],
    listNonCashAccounts: (): AccountWithBalance[] =>
      accountInstance
        .listNonCashAccounts()
        .map(decorateWithBalance)
        .filter(Boolean) as AccountWithBalance[],
    getCashAccount: (): AccountWithBalance | null =>
      decorateWithBalance(accountInstance.getCashAccount()),
    getById: (id: string | null): AccountWithBalance | null =>
      decorateWithBalance(accountInstance.getById(id)),
    getByUserIdAndType: (
      userId: string,
      type: Account['type']
    ): AccountWithBalance | null =>
      decorateWithBalance(accountInstance.getByUserIdAndType(userId, type)),
  };
}
