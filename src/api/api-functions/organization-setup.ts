import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

export const getAllDepartments = async() => {
    try {
        const response = await api.get(API_ENDPOINTS.ORGANIZATION.GET_ALL_DEPARTMENTS);
        console.log("SUCCESS - getAllDepartments response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - getAllDepartments failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

export const createDepartment = async (departmentData: {
    department_name: string;
    custom_department_code: string;
    company: string;
    custom_department_head: string;
}) => {
    try {
        const payload = {
            data: departmentData
        };
        const response = await api.post(API_ENDPOINTS.ORGANIZATION.CREATE_DEPARTMENT, payload);
        console.log("SUCCESS - createDepartment response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - createDepartment failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}