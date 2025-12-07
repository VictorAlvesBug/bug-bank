import { AccountWithBalance } from "../types/account.types";
import { formatCentsAsCurrency } from "../utils/currencyUtils";

type InvestmentAccountCardProps = {
    investmentAccount: AccountWithBalance;
};

export default function InvestmentAccountCard({
  investmentAccount,
}: InvestmentAccountCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-2xl border-slate-100">
      <div>
        <p className="text-xs text-slate-500">Valor investido</p>
        <p className="text-lg font-semibold text-slate-900">
          {formatCentsAsCurrency(investmentAccount.balance)}
        </p>
      </div>
      <span className="px-2 py-1 text-xs rounded-full text-emerald-500 bg-emerald-50">
        Simulação
      </span>
    </div>
  );
}
