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
      validateStatus: (status) => status < 500, // Don't throw for 4xx errors
    });

    // Check for successful response (2xx) and ensure success_key is 1
    if (response.status >= 200 && response.status < 300 && response.data?.message?.success_key === 1) {
      if (response.data) {
        // Don't store in localStorage here - let the loginWithOTP function handle that
        // after it processes the user data
        return {
          success: true,
          data: response.data,
        };
      }
      throw new Error("Invalid response format: Missing data");
    }

    // Handle non-successful responses
    const errorMessage = response.data?.message?.message === 'Authentication Error!' 
      ? 'Invalid email or password' 
      : response.data?.message?.message || response.data?.message || 'Invalid email or password';
    return {
      success: false,
      error: errorMessage,
      status: response.status,
      responseData: response.data // Include full response for debugging
    };
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

    // Clear all authentication related data from localStorage
    const itemsToRemove = [
      'apiKey',
      'apiSecret',
      'chaturvima_user',
      'auth_token',
      'refresh_token',
      'user_session',
      'user_data'
    ];
    
    itemsToRemove.forEach(item => localStorage.removeItem(item));
    
    // Clear all localStorage items that start with 'chaturvima_'
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('chaturvima_')) {
        localStorage.removeItem(key);
      }
    });
    
    if (response.data) {      
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
 