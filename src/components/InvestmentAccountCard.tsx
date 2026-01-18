import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AccountWithBalance } from '../types/account.types';
import { formatCentsAsCurrency } from '../utils/currencyUtils';

type InvestmentAccountCardProps = {
  checkingAccount: AccountWithBalance;
  investmentAccount: AccountWithBalance;
  onInvestmentOpen: () => void;
  onRescueOpen: () => void;
};

export default function InvestmentAccountCard({
  checkingAccount,
  investmentAccount,
  onInvestmentOpen: onInvestOpen,
  onRescueOpen,
}: InvestmentAccountCardProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white border shadow-sm rounded-2xl border-slate-100">
      <div className="flex-1">
        <p className="text-xs text-slate-500">Valor investido</p>
        <p className="text-lg font-semibold text-slate-900">
          {formatCentsAsCurrency(investmentAccount.balance)}
        </p>
      </div>
      <button
        className={
          'px-2 py-1 text-xs border rounded-full hover:bg-emerald-50 border-emerald-500 text-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed'
        }
        onClick={onInvestOpen}
        disabled={checkingAccount.balance === 0}
      >
        <FontAwesomeIcon icon={faPlus} /> Investir
      </button>
      <button
        className={
          'px-2 py-1 text-xs border rounded-full hover:bg-red-50 border-red-500 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed'
        }
        onClick={onRescueOpen}
        disabled={investmentAccount.balance === 0}
      >
        <FontAwesomeIcon icon={faMinus} /> Resgatar
      </button>
    </div>
  );
}
