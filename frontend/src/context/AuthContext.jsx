import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContextObject";
import { getCurrentUser, loginUser as loginRequest, registerUser as registerRequest } from "../Api/authApi";

const STORAGE_KEY = "auth_session";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const storedSession = window.localStorage.getItem(STORAGE_KEY);

    if (!storedSession) {
      return "";
    }

    try {
      return JSON.parse(storedSession).token ?? "";
    } catch {
      return "";
    }
  });
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedSession = window.localStorage.getItem(STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession).user ?? null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(Boolean(token));

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!token || !user) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
  }, [token, user]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const syncUser = async () => {
      setIsLoading(true);

      try {
        const data = await getCurrentUser(token);

        if (!isMounted) {
          return;
        }

        setUser(data.user);
      } catch {
        if (!isMounted) {
          return;
        }

        setToken("");
        setUser(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    syncUser();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (payload) => {
    const data = await loginRequest(payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
