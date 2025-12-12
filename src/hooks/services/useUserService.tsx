import useUserRepository from '../repositories/useUserRepository';

export default function useUserService() {
  const userRepository = useUserRepository();

  return userRepository;
}
