import { faArrowTrendUp, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CreateUserModal from '../components/CreateUserModal';
import MoneyModal from '../components/MoneyModal';
import UserCard from '../components/UserCard';
import { AccountWithBalance } from '../types/account.types';
import { User } from '../types/user.types';
import { formatCentsAsCurrency } from '../utils/currencyUtils';

type LoginProps = {
  cashAccount: AccountWithBalance;
  users: User[];
  accounts: AccountWithBalance[];
  isInvestmentEnabled: boolean;
  onChangeInvestmentEnabled: (enabled: boolean) => void;
  onResetApp: () => void;
  onSelectUser: (id: string) => void;
  onCreateUser: (name: string) => void;
  onChangeCashValue: (amount: number) => void;
};

export default function Login({
  cashAccount,
  users,
  accounts,
  isInvestmentEnabled,
  onChangeInvestmentEnabled,
  onResetApp,
  onSelectUser,
  onCreateUser,
  onChangeCashValue
}: LoginProps) {
  const [moneyModalOpen, setMoneyModalOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  function openChangeCashValue() {
    setMoneyModalOpen(true);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <header className="flex flex-col bg-white shadow">
        <div className='flex flex-row items-center justify-between flex-1 gap-2 px-4 py-3'><div className="flex flex-col">
          <h1 className="text-xl font-semibold text-slate-900">Bug Bank</h1>
          <p className="text-xs text-slate-500">Selecione um usuário</p>
        </div>
        <button
          className={"px-2 py-1 text-xs border rounded-full " + (isInvestmentEnabled ? "bg-blue-500 text-white border-blue-200 hover:bg-blue-400" : "text-blue-500 border-blue-200 hover:bg-blue-50")}
          onClick={() => onChangeInvestmentEnabled(!isInvestmentEnabled)}
        >
          <FontAwesomeIcon icon={faArrowTrendUp} />
        </button>
        <button
          className="px-2 py-1 text-xs text-red-500 border border-red-200 rounded-full hover:bg-red-50"
          onClick={onResetApp}
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        </div>
        <div className="flex flex-row items-center justify-center px-4 pb-3" onClick={openChangeCashValue}>
          <p className="text-xs text-slate-500">Em circulação: {formatCentsAsCurrency(cashAccount.balance)}/{formatCentsAsCurrency(cashAccount.initialBalance)}</p>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20">
        {users.length === 0 ? (
          <p className="text-sm text-slate-500">
            Crie seu primeiro usuário clicando no botão '+'.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {users.map((user) => {
              const checkingAccount = accounts.find(
                (acc) =>
                  acc.userId === user.id && acc.type === 'CheckingAccount'
              );
              const investmentAccount = accounts.find(
                (acc) =>
                  acc.userId === user.id &&
                  acc.type === 'ImmediateRescueInvestmentAccount'
              );

              if (!checkingAccount || !investmentAccount) {
                toast.error(
                  `Conta corrente ou de investimento de ${user.name} não foi encontrada`
                );
                return null;
              }

              return (
                <UserCard
                  key={user.id}
                  onSelectUser={onSelectUser}
                  user={user}
                  checkingAccount={checkingAccount}
                  investmentAccount={investmentAccount}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        className="fixed flex items-center justify-center text-3xl text-white transition bg-indigo-600 rounded-full shadow-lg bottom-5 right-5 h-14 w-14 hover:bg-indigo-500 active:scale-95"
        onClick={() => setIsCreateUserModalOpen(true)}
        aria-label="Adicionar novo usuário"
      >
        <FontAwesomeIcon icon={faPlus} size="xs" />
      </button>

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onCreateUser={onCreateUser}
      />
            <MoneyModal
              isOpen={moneyModalOpen}
              mode={'ChangeCashValue'}
              checkingAccountBalance={0}
              investmentAccountBalance={0}
              users={[]}
              onConfirm={onChangeCashValue}
              onClose={() => setMoneyModalOpen(false)}
            />
    </div>
  );
}
