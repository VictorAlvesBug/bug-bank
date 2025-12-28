import * as React from "react";
import createUserService from "../services/userService";
import { User } from "../types/user.types";

type UserService = ReturnType<typeof createUserService>;

export default function useUsersState() {
  const baseService = React.useMemo(() => createUserService(), []);

  const [users, setUsers] = React.useState<User[]>(() => baseService.listAll());

  const refreshUsers = React.useCallback(() => {
    setUsers(baseService.listAll());
  }, [baseService]);

  const userService = React.useMemo<UserService>(() => {
    return new Proxy(baseService, {
      get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);

        if (typeof value !== "function") return value;

        return (...args: any[]) => {
          const result = value.apply(target, args);

          if (!String(prop).includes("get") && !String(prop).includes("list")) {
            if (result instanceof Promise) {
              return result.finally(refreshUsers);
            }
            refreshUsers();
          }

          return result;
        };
      },
    });
  }, [baseService, refreshUsers]);

  return { users, userService, refreshUsers };
}
