import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

export const getAllDepartments = async() => {
    try {
        const response = await api.get(API_ENDPOINTS.ORGANIZATION.GET_ALL_DEPARTMENTS);
        console.log("SUCCESS - getAllDepartments response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;
    } catch (error) {
        console.error("ERROR - getAllDepartments failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}