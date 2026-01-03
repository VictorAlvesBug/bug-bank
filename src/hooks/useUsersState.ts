import * as React from "react";
import createUserService from "../services/userService";

export default function useUsersState() {
  const userService = React.useMemo(() => createUserService(), []);

  return { userService };
}
