import React, { useState } from 'react';
import { toast } from 'react-toastify';
import useAccountsState from '../hooks/useAccountsState';
import useUsersState from '../hooks/useUsersState';
import {
  Account,
  InvestmentOrCheckingAccountType,
} from '../types/account.types';
import { User } from '../types/user.types';
import Modal from './Common/Modal';

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateUserModal({
  isOpen,
  onClose,
}: CreateUserModalProps) {
  const [newUserName, setNewUserName] = useState('');
  const [error, setError] = useState('');
    const {userService, refreshUsers} = useUsersState();
  const {accountService, refreshAccounts} = useAccountsState();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    var name = newUserName.trim();

    if (!name) {
      setError('Informe o nome do usuário');
      return;
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name,
    };

    userService.add(newUser);
    refreshUsers();

    const accountTypes: InvestmentOrCheckingAccountType[] = [
      'CheckingAccount',
      'ImmediateRescueInvestmentAccount',
    ];

    accountTypes
      .map<Account>(
        (accountType): Account => ({
          id: `${newUser.id}-${accountType}`,
          userId: newUser.id,
          type: accountType,
          initialBalance: 0,
        })
      )
      .forEach(accountService.add);

      refreshAccounts();

    toast.success(`Seja bem-vindo, ${name}!`);

    setNewUserName('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Novo usuário">
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
              onClose();
              setNewUserName('');
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
  );
}
