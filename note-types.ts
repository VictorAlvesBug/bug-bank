/*
Tailwind CSS IntelliSense
Live Server
HTML Preview - All Frameworks
UIComposer
*/


type AccountType = 'CheckingAccount' | 'ImmediateRescue' | 'DelayedRescue';

type User = {
    id: string; // "{guid}"
    name: string; // "Victor Bugueno"
    pixKey: string; // "1001"
};

type Account = {
    id: string; // "{userId}-{type}"
    userId: string; // "{userId}"
    type: AccountType; // "{type}"
};

type Transaction = {
    id: string; // "{grid}"
    senderAccountId: string; // "{userId}-{type}"
    receiverAccountId: string; // "{userId}-{type}"
    amount: number; // "1234" --> R$ 12,34
    createdAt: string; // "{yyyy-MM-dd HH:mm}"
    delay: number; // 300_000 --> 5 minutos
};

 