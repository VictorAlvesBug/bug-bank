import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import CreateUserModal from '../components/CreateUserModal';
import UserCard from '../components/UserCard';
import { AccountWithBalance } from '../types/account.types';
import { User } from '../types/user.types';
import { formatCentsAsCurrency } from '../utils/currencyUtils';

type LoginProps = {
  cashAccount: AccountWithBalance;
  users: User[];
  accounts: AccountWithBalance[];
  onResetApp: () => void;
  onSelectUser: (id: string) => void;
  onCreateUser: (name: string) => void;
};

export default function Login({
  cashAccount,
  users,
  accounts,
  onResetApp,
  onSelectUser,
  onCreateUser,
}: LoginProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <header className="flex flex-row items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-slate-900">Bug Bank</h1>
          <p className="text-xs text-slate-500">
            Selecione um usuário
          </p>
        </div>
          <button
            className="px-3 py-1 text-xs text-red-500 border border-red-200 rounded-full hover:bg-red-50"
            onClick={onResetApp}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        <div className="flex flex-col items-end">
          <p className="text-xs text-slate-500">Dinheiro em espécie:</p>
          <p className="text-xs text-slate-500">
            {formatCentsAsCurrency(cashAccount.balance)}
          </p>
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
                alert(
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
        onClick={() => setIsModalOpen(true)}
        aria-label="Adicionar novo usuário"
      >
        <FontAwesomeIcon icon={faPlus} size="xs" />
      </button>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateUser={onCreateUser}
      />
    </div>
  );
}
