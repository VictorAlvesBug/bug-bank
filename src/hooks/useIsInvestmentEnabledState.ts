import { useCallback, useState } from 'react';
import localStorageUtils from '../utils/localStorageUtils';
import { toast } from 'react-toastify';

export default function useIsInvestmentEnabledState(): [boolean, () => void] {

    const { get, set } = localStorageUtils<boolean>('isInvestmentEnabled', false);
    const [state, setState] = useState<boolean>(get());

    var onToggle = useCallback(() => {
        const newState = !state;
        set(newState);
        setState(newState);

        toast.success(
            newState
                ? `Recurso de investimento habilitado`
                : `Recurso de investimento desabilitado`);
    }, [set, state]);

    return [state, onToggle];
}