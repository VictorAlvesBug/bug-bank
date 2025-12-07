const users = [
    {
        id: 'user0',
        name: 'Cash'
    },
    {
        id: 'user1',
        name: 'Victor Bugueno'
    },
    {
        id: 'user2',
        name: 'Pedro Henrique'
    }
];
 
const accounts = [
    {
        id: 'user0-Cash',
        userId: 'user0',
        type: 'Cash',
        initialBalance: 10_000_00
    },
    {
        id: 'user1-CheckingAccount',
        userId: 'user1',
        type: 'CheckingAccount',
        pixKey: '1111',
        initialBalance: 0
    },
    {
        id: 'user1-ImmediateRescue',
        userId: 'user1',
        type: 'ImmediateRescue',
        initialBalance: 0
    },
    {
        id: 'user2-CheckingAccount',
        userId: 'user2',
        type: 'CheckingAccount',
        pixKey: '2222',
        initialBalance: 0
    },
    {
        id: 'user2-ImmediateRescue',
        userId: 'user2',
        type: 'ImmediateRescue',
        initialBalance: 0
    },
];
 
const transactions = [
    /*{
        id: 'transaction0',
        senderAccountId: 'user0-Cash',
        receiverAccountId: 'user1-CheckingAccount',
        amount: 1234, // R$ 12,34
        createdAt: '2025-12-01 15:00:00',
        delay: 0
    }*/
];
 
const convertToDate = (strDate) => {
    const year = Number(strDate.substring(0, 4));
    const month = Number(strDate.substring(5, 7)) - 1;
    const day = Number(strDate.substring(8, 10));
    return new Date(year, month, day);
}
 
const calculateBalanceForAccount = (accountId, date) => {
    const account = accounts.find(account => account.id === accountId);
 
    if (!account)
        throw new Error(`Conta não encontrada para accountId = '${accountId}'`);
 
    const transactionsRelatedWithAccount = transactions
        .filter(({ senderAccountId, receiverAccountId }) =>
            [senderAccountId, receiverAccountId].includes(accountId));
 
    const transactionsUntilDate = transactionsRelatedWithAccount.filter(transaction => transaction.createdAt <= date)
 
    return transactionsUntilDate.reduce(
        (accBalance, transaction) => {
            if (accountId === transaction.senderAccountId)
                return accBalance - transaction.amount;
 
            if (accountId === transaction.receiverAccountId)
                return accBalance + transaction.amount;
 
            return accBalance;
        },
        account.initialBalance);
};
 
const addTransaction = ({
    senderAccountId,
    receiverAccountId,
    amount,
    date,
    delay = 0
}) => {
    if (!accounts.some(account => account.id === senderAccountId))
        throw new Error(`Conta não encontrada para senderAccountId = '${senderAccountId}'`);
 
    if (!accounts.some(account => account.id === receiverAccountId))
        throw new Error(`Conta não encontrada para receiverAccountId = '${receiverAccountId}'`);
 
    const senderBalance = calculateBalanceForAccount(senderAccountId, date);
 
    const amountInCents = amount * 100;
 
    if (senderBalance < amountInCents)
        throw new Error(`A conta de accountId = '${senderAccountId}' não tem saldo suficiente para enviar ${formatCentsAsCurrency(amountInCents)} (Saldo atual = ${formatCentsAsCurrency(senderBalance)})`);
 
    transactions.push({
        id: `transaction${transactions.length}`,
        senderAccountId,
        receiverAccountId,
        amount: amountInCents,
        createdAt: date,
        delay: delay
    })
}
 
const transfer = (senderUserId, receiverUserId, amount, strDate) => {
    if (!users.some(user => user.id === senderUserId))
        throw new Error(`Usuário não encontrado para senderUserId = '${senderUserId}'`);
 
    if (!users.some(user => user.id === receiverUserId))
        throw new Error(`Usuário não encontrado para receiverUserId = '${receiverUserId}'`);
 
    addTransaction({
        senderAccountId: `${senderUserId}-CheckingAccount`,
        receiverAccountId: `${receiverUserId}-CheckingAccount`,
        amount,
        date: convertToDate(strDate)
    });
}
 
const pixTransfer = (senderUserId, receiverPixKey, amount, strDate) => {
    if (!users.some(user => user.id === senderUserId))
        throw new Error(`Usuário não encontrado para senderUserId = '${senderUserId}'`);
 
    const receiverAccount = accounts.find(account => account.pixKey === receiverPixKey && account.type === 'CheckingAccount');
 
    if (!receiverAccount)
        throw new Error(`Chave PIX '${receiverPixKey}' inválida`);
 
    addTransaction({
        senderAccountId: `${senderUserId}-CheckingAccount`,
        receiverAccountId: receiverAccount.id,
        amount,
        date: convertToDate(strDate)
    });
}
 
const withdraw = (userId, amount, strDate) => {
    if (!users.some(user => user.id === userId))
        throw new Error(`Usuário não encontrado para userId = '${userId}'`);
 
    addTransaction({
        senderAccountId: `${userId}-CheckingAccount`,
        receiverAccountId: 'user0-Cash',
        amount,
        date: convertToDate(strDate)
    });
}
 
const deposit = (userId, amount, strDate) => {
    if (!users.some(user => user.id === userId))
        throw new Error(`Usuário não encontrado para userId = '${userId}'`);
 
    addTransaction({
        senderAccountId: 'user0-Cash',
        receiverAccountId: `${userId}-CheckingAccount`,
        amount,
        date: convertToDate(strDate)
    });
}
 
const makeInvestment = (userId, amount, strDate) => {
    if (!users.some(user => user.id === userId))
        throw new Error(`Usuário não encontrado para userId = '${userId}'`);
 
    addTransaction({
        senderAccountId: `${userId}-CheckingAccount`,
        receiverAccountId: `${userId}-ImmediateRescue`,
        amount,
        date: convertToDate(strDate)
    });
}
 
const rescueInvestment = (userId, amount, strDate) => {
    if (!users.some(user => user.id === userId))
        throw new Error(`Usuário não encontrado para userId = '${userId}'`);
 
    addTransaction({
        senderAccountId: `${userId}-ImmediateRescue`,
        receiverAccountId: `${userId}-CheckingAccount`,
        amount,
        date: convertToDate(strDate)
    });
}
 
const calculateBalanceForCash = (strDate) => {
    return calculateBalanceForAccount('user0-Cash', convertToDate(strDate));
};
 
const calculateBalanceForUser = (userId, type, strDate) => {
    if (!users.some(user => user.id === userId))
        throw new Error(`Usuário não encontrado para userId = '${userId}'`);
 
    const validAccountTypes = ['CheckingAccount', 'ImmediateRescue'];
 
    if (!validAccountTypes.includes(type))
        throw new Error(`Tipo de conta '${type}' não reconhecido`);
 
    const accountId = userId === 'user0' ? 'user0-Cash' : `${userId}-${type}`;
 
    return calculateBalanceForAccount(accountId, convertToDate(strDate));
};
 
const formatCentsAsCurrency = (centsAmount) =>
    (centsAmount / 100).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
 
const ids = {
    cash: 'user0',
    victorBugueno: 'user1',
    pedroHenrique: 'user2',
}
 
deposit(ids.victorBugueno, 1000, '2025-01-01');
pixTransfer(ids.victorBugueno, '2222', 200, '2025-01-02');
makeInvestment(ids.victorBugueno, 800, '2025-01-02');
withdraw(ids.pedroHenrique, 150, '2025-01-05');
 
const checkingAccount = 'CheckingAccount';
const immediateRescue = 'ImmediateRescue';
const strDate = '2025-01-05'
 
const info = {
    cash: {
        balance: formatCentsAsCurrency(calculateBalanceForCash(strDate)),
        invested: formatCentsAsCurrency(0)
    },
    victorBugueno: {
        balance: formatCentsAsCurrency(calculateBalanceForUser(ids.victorBugueno, checkingAccount, strDate)),
        invested: formatCentsAsCurrency(calculateBalanceForUser(ids.victorBugueno, immediateRescue, strDate))
    },
    pedroHenrique: {
        balance: formatCentsAsCurrency(calculateBalanceForUser(ids.pedroHenrique, checkingAccount, strDate)),
        invested: formatCentsAsCurrency(calculateBalanceForUser(ids.pedroHenrique, immediateRescue, strDate))
    },
}
 
console.table(info);