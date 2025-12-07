import { User } from '../types/user.types';
import useLocalStorage from './useLocalStorage';

export default function useUsersState() {
    return useLocalStorage<User[]>('users', []);
}