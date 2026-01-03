import { User } from '../types/user.types';
import localStorageUtils from '../utils/localStorageUtils';

const createUserRepository = (() => {
    const { get, set } = localStorageUtils<User[]>('users', []);

    const listAll = () => get();
    const getById = (id: string | null) => get().find((user) => user.id === id) || null;
    const add = (user: User) => set([...get(), user]);
    const update = (updatedUser: User) => set(get().map((user) => user.id === updatedUser.id ? updatedUser : user));
    const reset = () => set([]);

    return () => {
        return {
            listAll,
            getById,
            add,
            update,
            reset
        };
    }
})();

export default createUserRepository;