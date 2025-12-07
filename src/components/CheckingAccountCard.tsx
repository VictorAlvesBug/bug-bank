import { AccountWithBalance } from '../types/account.types';
import { formatCentsAsCurrency } from '../utils/currencyUtils';

type CheckingAccountCardProps = {
    checkingAccount: AccountWithBalance;
};

export default function CheckingAccountCard({checkingAccount}: CheckingAccountCardProps) {
  return (
    <div className="p-4 text-indigo-600 bg-white shadow rounded-2xl">
            <p className="text-xs text-indigo-500">Conta corrente</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatCentsAsCurrency(checkingAccount.balance)}
            </p>
          </div>
  )
}
