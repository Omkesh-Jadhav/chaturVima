import api from "../axios-setup";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api({
      method: 'POST',
      url: '/api/method/chaturvima_api.api.auth.login',
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

