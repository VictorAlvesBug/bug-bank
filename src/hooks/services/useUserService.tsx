import useUserRepository from '../repositories/userRepository';

export default function useUserService() {
  const userRepository = useUserRepository();

  return userRepository;
}
