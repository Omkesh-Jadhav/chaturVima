import api from "../axios-setup";
import { API_ENDPOINTS } from "../endpoints";

export const getOrganizationDetails = async (companyName: string) => {
    try {
        const fields = [
            "name",
            "company_name", 
            "custom_organization_type",
            "custom_organization_size",
            "custom_industry",
            "website",
            "phone_no",
            "email",
            "custom_city",
            "custom_state",
            "country"
        ];
        
        const url = `${API_ENDPOINTS.ORGANIZATION.GET_ORGANIZATION_DETAILS}/${companyName}?fields=${JSON.stringify(fields)}`;
        const response = await api.get(url);
        console.log("SUCCESS - getOrganizationDetails response:", response);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - getOrganizationDetails failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

export const updateOrganizationDetails = async(organizationData: {
    company_name: string;
    custom_organization_type: string;
    custom_organization_size: string;
    custom_industry: string;
    website: string;
    phone_no: string;
    email: string;
    custom_city: string;
    custom_state: string;
    country: string;
}) => {
    try {
        const payload = {
            ...organizationData
        };
        const response = await api.put(API_ENDPOINTS.ORGANIZATION.UPDATE_ORGANIZATION_DETAILS, payload);
        console.log("SUCCESS - updateOrganizationDetails response:", response);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - updateOrganizationDetails failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

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
}) => {
    try {
        const payload = {
            name: departmentData.name,
            department_name: departmentData.department_name,
            custom_department_code: departmentData.custom_department_code,
            company: departmentData.company,
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

export const deleteDepartment = async (name: string) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.ORGANIZATION.DELETE_DEPARTMENT}/${name}`);
        console.log("SUCCESS - deleteDepartment response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("ERROR - deleteDepartment failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

export const getEmployees = async (department?: string) => {
    try {
        const fields = ["name", "designation", "employee_name", "user_id", "department", "reports_to", "company_email"];
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
    reports_to: string
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

export const editEmployeeDetails = async (name: string, employeeData: any) => {
    try {
        const payload = {
            data: employeeData
        }

        const response = await api.put(`${API_ENDPOINTS.ORGANIZATION.EDIT_EMPLOYEE_DETAILS}/${name}`, payload);
        console.log("SUCCESS - editEmployeeDetails response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;

    } catch (error: any) {
        console.error("ERROR - Edit employee details failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}

export const deleteEmployee = async (name: string) => {
    try {
        const response = await api.delete(`${API_ENDPOINTS.ORGANIZATION.DELETE_EMPLOYEE}/${name}`);
        console.log("SUCCESS - deleteEmployee response:", response);
        console.log("SUCCESS - Response data:", response.data);
        return response.data;

    } catch (error: any) {
        console.error("ERROR - Delete employee failed:", error);
        console.error("ERROR - Error response:", error.response);
        console.error("ERROR - Error data:", error.response?.data);
        throw error;
    }
}