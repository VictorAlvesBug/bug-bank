import * as React from "react";
import createTransactionService from "../services/transactionService";
import { Transaction } from "../types/transaction.types";

type TransactionService = ReturnType<typeof createTransactionService>;

export default function useTransactionsState() {
  const baseService = React.useMemo(() => createTransactionService(), []);

  const [transactions, setTransactions] = React.useState<Transaction[]>(() => baseService.listAll());

  const refreshTransactions = React.useCallback(() => {
    setTransactions(baseService.listAll());
  }, [baseService]);

  const transactionService = React.useMemo<TransactionService>(() => {
    return new Proxy(baseService, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value !== "function") return value;

        return (...args: any[]) => {
          const result = value.apply(target, args);

          //if (!String(prop).includes("get") && !String(prop).includes("list")) {
            if (result instanceof Promise) {
              return result.finally(refreshTransactions);
            }
            refreshTransactions();
          //}

          return result;
        };
      },
    });
  }, [baseService, refreshTransactions]);

  return { transactions, transactionService };
}
