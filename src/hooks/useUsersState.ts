import { Dispatch, SetStateAction } from 'react';
import { User } from '../types/user.types';
import useLocalStorage from './useLocalStorage';

export default function useUsersState(): [
    User[],
    Dispatch<SetStateAction<User[]>>,
    () => void
]{
    const [users, setUsers] = useLocalStorage<User[]>('users', []);

    const resetUsers = () => setUsers([]);

    return [users, setUsers, resetUsers];
}