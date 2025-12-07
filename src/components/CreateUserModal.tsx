import React, { useState } from 'react';
import Modal from './Common/Modal';

type CreateUserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateUser: (name: string) => void;
};

export default function CreateUserModal({
  isOpen,
  onClose,
  onCreateUser,
}: CreateUserModalProps) {
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
