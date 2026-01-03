import * as React from "react";
import createAccountService from "../services/accountService";
import { AccountWithBalance } from "../types/account.types";

type AccountService = ReturnType<typeof createAccountService>;

export default function useAccountsState() {
  const baseService = React.useMemo(() => createAccountService(), []);

  const [accounts, setAccounts] = React.useState<AccountWithBalance[]>(() => baseService.listAll());

  const refreshAccounts = React.useCallback(() => {
    setAccounts(baseService.listAll());
  }, [baseService]);

  const accountService = React.useMemo<AccountService>(() => {
    return new Proxy(baseService, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value !== "function") return value;

        return (...args: any[]) => {
          const result = value.apply(target, args);

          //if (!String(prop).includes("get") && !String(prop).includes("list")) {
            if (result instanceof Promise) {
              return result.finally(refreshAccounts);
            }
            refreshAccounts();
          //}

          return result;
        };
      },
    });
  }, [baseService, refreshAccounts]);

  return { accounts, accountService };
}
