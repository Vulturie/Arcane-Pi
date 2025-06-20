import React, { createContext, useState } from "react";

export const UserContext = createContext({
  user: null,
  setUser: () => {},
  accessToken: null,
  setAccessToken: () => {},
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser, accessToken, setAccessToken }}>
      {children}
    </UserContext.Provider>
  );
}
