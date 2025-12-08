import useLocalStorage from './useLocalStorage';

export default function useIsInvestmentEnabledState(){
    return useLocalStorage<boolean>('isInvestmentEnabled', false);
}