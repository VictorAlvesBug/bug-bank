import * as React from "react";
import createTransactionService from "../services/transactionService";

export default function useTransactionsState() {
  const transactionService = React.useMemo(() => createTransactionService(), []);

  return { transactionService };
}
