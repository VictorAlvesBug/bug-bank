import { useCallback, useState } from 'react';
import localStorageUtils from '../utils/localStorageUtils';
import { toast } from 'react-toastify';

export default function useIsInvestmentEnabledState() {

    const { get, set } = localStorageUtils<boolean>('isInvestmentEnabled', true);
    const [state, setState] = useState<boolean>(get());

    const onToggle = useCallback(() => {
        const newState = !state;
        set(newState);
        setState(newState);

        toast.success(
            newState
                ? `Recurso de investimento habilitado`
                : `Recurso de investimento desabilitado`);
    }, [set, state]);

    const investmentEnabledReset = useCallback(() => {
        set(true);
        setState(true);
    }, [set]);

    return {
        isInvestmentEnabled: state,
        toggleInvestmentEnabled: onToggle,
        investmentEnabledReset
    };
}