export type Cash = {
    id: 'cash-Cash',
    userId: 'cash',
    type: 'Cash',
    initialBalance: number;
}

export type InvestmentOrCheckingAccount = {
    id: string, // "{userId}-{type}"
    userId: string,
    type: 'ImmediateRescueInvestmentAccount'| 'CheckingAccount',
    initialBalance: 0
}

export type Account = Cash | InvestmentOrCheckingAccount;

export type AccountWithBalance = Account & {
    balance: number
};

export type AccountType = Account["type"];
export type InvestmentOrCheckingAccountType = InvestmentOrCheckingAccount["type"];