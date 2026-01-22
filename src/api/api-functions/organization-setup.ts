import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

export const getAllDepartments = async () => {
    try {
        const response = await api.get(API_ENDPOINTS.ORGANIZATION.GET_ALL_DEPARTMENTS);
        console.log("SUCCESS - getAllDepartments response:", response);
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

export const updateDepartment = async (departmentData: {
    name: string;
    department_name: string;
    custom_department_code: string;
    company: string;
    custom_department_head: string;
}) => {
    try {
        const payload = {
            name: departmentData.name,
            department_name: departmentData.department_name,
            custom_department_code: departmentData.custom_department_code,
            company: departmentData.company,
            custom_department_head: departmentData.custom_department_head,
        };
        const response = await api.put(`${API_ENDPOINTS.ORGANIZATION.UPDATE_DEPARTMENT}/${departmentData.name}`, payload);
        console.log("SUCCESS - updateDepartment response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - updateDepartment failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

export const getEmployees = async (department?: string) => {
    try {
        const fields = ["name", /* "email", */ "designation", "employee_name", "user_id", "department"];
        let url = `${API_ENDPOINTS.ORGANIZATION.GET_EMPLOYEES}?fields=${JSON.stringify(fields)}`;
        
        if (department) {
            const filters = [["department", "=", department]];
            url += `&filters=${JSON.stringify(filters)}`;
        }
        
        const response = await api.get(url);
        console.log("SUCCESS - getEmployees response:", response);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - getEmployees failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

export const createEmployee = async (employeeData: {
    first_name: string,
    last_name: string,
    employee_name: string,
    company: string,
    email: string,
    gender: string,
    designation: string,
    role_profile: string,
    department: string,
    date_of_birth: string,
    date_of_joining: string,
    reportingTo: string
}) => {
    try {
        const payload = {
            data: employeeData
        }

        const response = await api.post(API_ENDPOINTS.ORGANIZATION.CREATE_EMPLOYEE, payload);
        console.log("SUCCESS - createEmployee response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;

    } catch (error: any) {
        console.error("ERROR - Create department failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

export const getEmployeeDetails = async (name: string) => {
    try {
        const response = await api.get(`${API_ENDPOINTS.ORGANIZATION.GET_EMPLOYEE_DETAILS}/${name}`);
        console.log("SUCCESS - getEmployeeDetails response:", response);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - getEmployeeDetails failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}