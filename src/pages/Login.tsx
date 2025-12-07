import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import Modal from '../components/Common/Modal';
import UserCard from '../components/UserCard';
import { User } from '../types/user.types';
import { AccountWithBalance } from '../types/account.types';
import { formatCentsAsCurrency } from '../utils/currencyUtils';

type LoginProps = {
  cashAccount: AccountWithBalance;
  users: User[];
  accounts: AccountWithBalance[];
  onSelectUser: (id: string) => void;
  onCreateUser: (name: string) => void;
};

export default function Login({
  cashAccount,
  users,
  accounts,
  onSelectUser,
  onCreateUser,
}: LoginProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserName.trim()) {
      setError('Informe o nome do usuário.');
      return;
    }
    onCreateUser(newUserName);
    setNewUserName('');
    setError('');
    setIsModalOpen(false);
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <header className="flex flex-row items-center justify-between px-4 py-3 bg-white shadow">
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold text-slate-900">Bug Bank</h1>
          <p className="text-xs text-slate-500">
            Selecione um usuário para entrar
          </p>
        </div>
        <div className="flex flex-col items-end">
          <p className="text-xs text-slate-500">
            Dinheiro em espécie:
          </p>
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
              const checkingAccount = accounts.find(acc => acc.userId === user.id && acc.type === "CheckingAccount");
              const investmentAccount = accounts.find(acc => acc.userId === user.id && acc.type === "ImmediateRescueInvestmentAccount");

              if(!checkingAccount || !investmentAccount){
                alert(`Conta corrente ou de investimento de ${user.name} não foi encontrada`);
                return null;
              }

              return (
              <UserCard key={user.id} onSelectUser={onSelectUser} user={user} checkingAccount={checkingAccount} investmentAccount={investmentAccount} />
            )
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

      {/* Modal de novo usuário */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Novo usuário"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-slate-700">
              Nome
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 text-sm border rounded-lg border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newUserName}
              onChange={(e) => {
                setNewUserName(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setIsModalOpen(false);
                setError('');
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
