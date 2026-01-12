import axios from "axios";
import { API_ENDPOINTS } from "../endpoints";

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(API_ENDPOINTS.AUTH.LOG_IN, {
      usr: email,
      pwd: password,
    });

    if (response.data) {
      let apiData;

      if (response.data.message) {
        const { message, home_page, full_name } = response.data;

        apiData = {
          success_key: message.success_key,
          message: message.message,
          sid: message.sid,
          api_key: message.api_key,
          api_secret: message.api_secret,
        };
      } else if (response.data.api_key) {
        // Structure: { api_key, api_secret, full_name, ... } (direct structure)
        apiData = response.data;
      } else {
        console.error("Unrecognized response structure:", response.data);
        throw new Error("Invalid response format: missing expected fields");
      }

      // Return structured response matching what AuthContext expects
      return {
        success: true,
        data: apiData,
      };
    }

    throw new Error("Invalid response format");
  } catch (error) {
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
