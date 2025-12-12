export type DepositOrWithdraw = {
    id: string;
    type: "Deposit" | "Withdraw";
    senderAccountId: string;
    receiverAccountId: string;
    amount: number; // 1234 --> R$ 12,34
    createdAt: string; // ISO
    delay?: never;
    comment?: string;
};

export type Pix = {
    id: string;
    type: "Pix";
    senderAccountId: string;
    receiverAccountId: string;
    amount: number; // 1234 --> R$ 12,34
    createdAt: string; // ISO
    delay?: never;
    comment?: string;
};

export type Investment = {
    id: string;
    type: "Investment";
    senderAccountId: string;
    receiverAccountId: string;
    amount: number; // 1234 --> R$ 12,34
    createdAt: string; // ISO
    delay?: never;
    comment?: never;
};

export type Rescue = {
    id: string;
    type: "Rescue";
    senderAccountId: string;
    receiverAccountId: string;
    amount: number; // 1234 --> R$ 12,34
    createdAt: string; // ISO
    delay?: number; // 300_000 --> 5 minutos
    comment?: never;
};

export type Yield = {
    id: string;
    type: "Yield";
    senderAccountId?: never;
    receiverAccountId: string;
    amount: number; // 1234 --> R$ 12,34
    createdAt: string; // ISO
    delay?: never;
    comment?: string;
};

export type Transaction = DepositOrWithdraw | Pix | Investment | Rescue | Yield;

export type TransactionType = Transaction["type"];

export type MoneyActionMode = (DepositOrWithdraw | Pix | Investment | Rescue)["type"] | 'ChangeCashValue'