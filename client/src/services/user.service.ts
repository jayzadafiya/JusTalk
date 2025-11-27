import api from "@/lib/axios";
import { User } from "@/types";
import { AxiosError } from "axios";

export const updateProfile = async (data: {
  firstName?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
}): Promise<{
  success: boolean;
  message?: string;
  data?: User;
  errors?: Array<{ field?: string; message: string }>;
}> => {
  try {
    const response = await api.put<{
      success: boolean;
      message?: string;
      data?: User;
      errors?: Array<{ field?: string; message: string }>;
    }>("/user/profile", data);

    if (response.data.success && response.data.data) {
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      return error.response.data;
    }
    throw error;
  }
};
