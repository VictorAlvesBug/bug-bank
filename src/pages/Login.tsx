import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserCard from '../components/UserCard';
import { User } from '../types/user.types';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';

type LoginProps = {
  users: User[];
  onSelectUser: (id: string) => void;
  onCreateUser: (name: string) => void;
};

export default function Login({ users, onSelectUser, onCreateUser }: LoginProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserName.trim()) {
      setError("Informe o nome do usuário.");
      return;
    }
    onCreateUser(newUserName);
    setNewUserName("");
    setError("");
    setIsModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="px-4 py-3 shadow bg-white">
        <h1 className="text-xl font-semibold text-slate-900">Bug Bank</h1>
        <p className="text-xs text-slate-500">Selecione um usuário para entrar</p>
      </header>

      <main className="flex-1 p-4 pb-20">
        {users.length === 0 ? (
          <p className="text-sm text-slate-500">
            Nenhum usuário cadastrado ainda. Use o botão + para criar um.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {users.map((user) => (
              <button
                key={user.id}
                className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow-md transition flex justify-between items-center"
                onClick={() => onSelectUser(user.id)}
              >
                <div>
                  <div className="text-sm text-slate-500">Entrar como</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {user.name}
                  </div>
                </div>
                <span className="text-xs text-slate-400">Tap to login</span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <button
        className="fixed bottom-5 right-5 h-14 w-14 rounded-full bg-indigo-600 shadow-lg flex items-center justify-center text-white text-3xl hover:bg-indigo-500 active:scale-95 transition"
        onClick={() => setIsModalOpen(true)}
        aria-label="Adicionar novo usuário"
      >
        +
      </button>

      {/* Modal de novo usuário */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo usuário">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nome do usuário
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={newUserName}
              onChange={(e) => {
                setNewUserName(e.target.value);
                setError("");
              }}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={() => {
                setIsModalOpen(false);
                setError("");
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
