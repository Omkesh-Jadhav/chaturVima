import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.LOG_IN,
      data: {
        username: email,
        password: password,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.data) {
      // Return structured response for successful login
      return {
        success: true,
        data: response.data,
      };
    }

    throw new Error("Invalid response format");
  } catch (error: any) {
    console.error("Login error:", error);

    if (error.response) {
      const errorMessage = error.response.data?.message || "Login failed";
      return {
        success: false,
        error: errorMessage,
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
};

export const LogoutUser = async () => {
  try {
    const response = await api({
      method: 'POST',
      url: API_ENDPOINTS.AUTH.LOG_OUT,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.data) {
      // Clear authentication tokens on successful logout
      localStorage.removeItem('apiKey');
      localStorage.removeItem('apiSecret');
      
      return {
        success: true,
        data: response.data,
      };
    }

    throw new Error("Invalid response format");
  } catch (error: any) {
    console.error("Logout error:", error);

    if (error.response) {
      const errorMessage = error.response.data?.message || "Logout failed";
      return {
        success: false,
        error: errorMessage,
        status: error.response.status,
      };
    }

    return {
      success: false,
      error: error.message || "Network error occurred",
    };
  }
}

