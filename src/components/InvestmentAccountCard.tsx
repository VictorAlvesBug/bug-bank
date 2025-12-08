import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AccountWithBalance } from "../types/account.types";
import { formatCentsAsCurrency } from "../utils/currencyUtils";

type InvestmentAccountCardProps = {
    investmentAccount: AccountWithBalance;
    onInvestOpen: () => void;
    onRescueOpen: () => void;
};

export default function InvestmentAccountCard({
  investmentAccount,
  onInvestOpen,
  onRescueOpen
}: InvestmentAccountCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border shadow-sm rounded-2xl border-slate-100 gap-4">
      <div className="flex-1">
        <p className="text-xs text-slate-500">Valor investido</p>
        <p className="text-lg font-semibold text-slate-900">
          {formatCentsAsCurrency(investmentAccount.balance)}
        </p>
      </div>
        <button
          className={"px-2 py-1 text-xs border rounded-full hover:bg-emerald-50 border-emerald-500 text-emerald-500"}
          onClick={onInvestOpen}
        >
          <FontAwesomeIcon icon={faPlus} /> {" "} Investir
        </button>
        <button
          className={"px-2 py-1 text-xs border rounded-full hover:bg-red-50 border-red-500 text-red-500"}
          onClick={onRescueOpen}
        >
          <FontAwesomeIcon icon={faMinus} /> {" "} Resgatar
        </button>
    </div>
  );
}
