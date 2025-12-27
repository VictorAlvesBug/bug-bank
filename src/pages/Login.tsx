import {
  faArrowTrendUp,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CashAmountModal from '../components/CashAmountModal';
import CreateUserModal from '../components/CreateUserModal';
import UserCard from '../components/UserCard';
import createAccountService from '../services/accountService';
import createTransactionService from '../services/transactionService';
import createUserService from '../services/userService';
import { AccountWithBalance } from '../types/account.types';
import { formatCentsAsCurrency } from '../utils/currencyUtils';
import Nfc from 'nfc-react-web';
import NFCReader from '../components/NFCReader';

type LoginProps = {
  cashAccount: AccountWithBalance;
  accounts: AccountWithBalance[];
  isInvestmentEnabled: boolean;
  onToggleInvestmentEnabled: () => void;
  onSelectUser: (id: string) => void;
};

export default function Login({
  cashAccount,
  isInvestmentEnabled,
  onToggleInvestmentEnabled,
  onSelectUser,
}: LoginProps) {
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [cashAmountModalOpen, setCashAmountModalOpen] = useState(false);
  const userService = createUserService();
  const accountService = createAccountService();
  const transactionService = createTransactionService();

  function handleResetApp() {
    userService.reset();
    accountService.reset();
    transactionService.reset();

    toast.success(`Os dados do aplicativo foram limpos`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <header className="flex flex-col bg-white shadow">
        <div className="flex flex-row items-center justify-between flex-1 gap-2 px-4 py-3">
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-slate-900">Bug Bank</h1>
            <p className="text-xs text-slate-500">Selecione um usuário</p>
          </div>
          <button
            className={
              'px-2 py-1 text-xs border rounded-full ' +
              (isInvestmentEnabled
                ? 'bg-blue-500 text-white border-blue-200 hover:bg-blue-400'
                : 'text-blue-500 border-blue-200 hover:bg-blue-50')
            }
            onClick={() => onToggleInvestmentEnabled()}
          >
            <FontAwesomeIcon icon={faArrowTrendUp} />
          </button>
          <button
            className="px-2 py-1 text-xs text-red-500 border border-red-200 rounded-full hover:bg-red-50"
            onClick={handleResetApp}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
        <div
          className="flex flex-row items-center justify-between px-4 pb-3"
          onClick={() => setCashAmountModalOpen(true)}
        >
          <p className="text-xs text-slate-500">Em circulação:</p>{' '}
          <p className="text-xs text-slate-500">
            {formatCentsAsCurrency(cashAccount.balance)}/
            {formatCentsAsCurrency(cashAccount.initialBalance)}
          </p>
        </div>
      </header>

      <main className="flex-1 p-4 pb-20">
        {userService.listAll().length === 0 ? (
          <p className="text-sm text-slate-500">
            Crie seu primeiro usuário clicando no botão '+'.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {userService.listAll().map((user) => {
              const checkingAccount = accountService.getByUserIdAndType(
                user.id,
                'CheckingAccount'
              );
              const investmentAccount = accountService.getByUserIdAndType(
                user.id,
                'ImmediateRescueInvestmentAccount'
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
        onClick={() => setCreateUserModalOpen(true)}
        aria-label="Adicionar novo usuário"
      >
        <FontAwesomeIcon icon={faPlus} size="xs" />
      </button>

      <CreateUserModal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
      />
      <CashAmountModal
        isOpen={cashAmountModalOpen}
        cashAccount={cashAccount}
        onClose={() => setCashAmountModalOpen(false)}
      />
    </div>
  );
}
