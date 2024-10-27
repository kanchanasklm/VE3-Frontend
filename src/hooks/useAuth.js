// src/hooks/useAuth.js
import { useState } from "react";
import axiosInstance from "../../axios";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/auth/login", {
        username: email,
        password,
      });
      return response.data; // Adjust based on your API response
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export const useSignup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signup = async (email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/auth/register", {
        username: email,
        password,
        email,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
};
