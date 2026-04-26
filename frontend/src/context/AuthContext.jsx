import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContextValue";

const getSavedToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const getSavedUser = () => {
  const savedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
};

const getStorageForToken = (tokenValue) =>
  localStorage.getItem("token") === tokenValue ? localStorage : sessionStorage;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getSavedToken);
  const [user, setUser] = useState(getSavedUser);
  const loading = Boolean(token && !user);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  }, [navigate]);

  const refreshUser = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);

        const storage = getStorageForToken(token);
        storage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error("Failed to refresh the user:", err);
    }
  }, [token]);

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 403 &&
          error.response?.data?.message?.includes("blocked")
        ) {
          logout();
        }

        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  useEffect(() => {
    if (!token || user) return;

    let didCancel = false;

    const loadUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!didCancel && res.data.success) {
          const updatedUser = res.data.user;
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } catch (err) {
        if (!didCancel) {
          console.error("Failed to refresh the user:", err);
        }
      }
    };

    loadUser();
    return () => {
      didCancel = true;
    };
  }, [token, user]);

  const saveAuthData = (tokenValue, userValue) => {
    setToken(tokenValue);
    setUser(userValue);
    localStorage.setItem("token", tokenValue);
    localStorage.setItem("user", JSON.stringify(userValue));
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token: authToken, user: authUser } = res.data;
      saveAuthData(authToken, authUser);

      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login denied or failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);
      return {
        success: true,
        message: res.data.message,
      };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
