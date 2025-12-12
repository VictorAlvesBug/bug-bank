import { User } from '../../types/user.types';
import useLocalStorage from '../useLocalStorage';

export default function useUserRepository(){
    const [users, setUsers] = useLocalStorage<User[]>('users', []);

    return {
        listAll: () => users,
        getById: (id: string | null) => users.find((user) => user.id === id) || null,
        add: (user: User) => setUsers((prev) => [...prev, user]),
        update: (updatedUser: User) => setUsers((prev) =>
            prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
        ),
        reset: () => setUsers([])
    };
}