import createUserRepository from '../repositories/userRepository';

export default function createUserService() {
  const instance = createUserRepository();

  return instance;
}
