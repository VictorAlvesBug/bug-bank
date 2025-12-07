import { AccountWithBalance } from '../types/account.types';
import { User } from '../types/user.types';
import { formatCentsAsCurrency } from '../utils/currencyUtils';

type UserCardProps = {
  onSelectUser: (userId: string) => void;
  user: User;
  checkingAccount: AccountWithBalance;
  investmentAccount: AccountWithBalance;
};

export default function UserCard({
  onSelectUser,
  user,
  checkingAccount,
  investmentAccount,
}: UserCardProps) {
  return (
    <button
      className="flex items-center justify-between p-4 text-left transition bg-white border shadow-sm rounded-xl border-slate-200 hover:shadow-md"
      onClick={() => onSelectUser(user.id)}
    >
      <div>
        <div className="text-sm text-slate-500">Entrar como</div>
        <div className="text-lg font-semibold text-slate-900">{user.name}</div>
      </div>
      <div className="flex flex-col items-end">
        <div className='flex flex-row items-center gap-2'>
          <div className="text-sm text-slate-500">Conta: </div>
          <div className="font-semibold text-md text-slate-900">
            {formatCentsAsCurrency(checkingAccount.balance)}
          </div>
        </div>
        <div className='flex flex-row items-center gap-2'>
          <div className="text-sm text-slate-500">Investido: </div>
          <div className="font-semibold text-md text-slate-900">
            {formatCentsAsCurrency(investmentAccount.balance)}
          </div>
        </div>
      </div>
    </button>
  );
}
