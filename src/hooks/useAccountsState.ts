import * as React from "react";
import createAccountService from "../services/accountService";

export default function useAccountsState() {
  const accountService = React.useMemo(() => createAccountService(), []);

  return { accountService };
}
