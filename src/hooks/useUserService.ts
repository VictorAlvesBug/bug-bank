import useLocalStorage from './useLocalStorage';
import { User } from '../types/user.types';
import { useCallback } from 'react';

export function useUsersState() {
    const initialUsers: User[] = [{
        id: 'user0',
        name: 'Cash'
    }];

    return useLocalStorage<User[]>('users', initialUsers);
}

export default function useUserService() {
    const [users, setUsers] = useUsersState();

    const listAll = useCallback(() => users, [users]);

    const getById = useCallback((id: string) => users.find(user => user.id === id), [users]);
    
    const save = useCallback((user: User) => setUsers(prev => [...prev, user]), [setUsers]);

    return {
        listAll,
        getById,
        save
    }
}