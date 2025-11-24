import api from "@lib/axios";
import { AxiosError } from "axios";
import type {
  SignupData,
  LoginData,
  AuthResponse,
  UsernameCheckResponse,
  User,
} from "@types";

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/user/signup", data);

    if (response.data.success && response.data.data) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>("/user/login", data);

    if (response.data.success && response.data.data) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const checkUsername = async (
  username: string
): Promise<UsernameCheckResponse> => {
  try {
    const response = await api.post<UsernameCheckResponse>(
      "/user/check-username",
      {
        username,
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/user/profile");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};
