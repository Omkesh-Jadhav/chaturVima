import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmployee, getEmployees, getEmployeeDetails, editEmployeeDetails, getOrganizationDetails } from "@/api/api-functions/organization-setup";

// Query keys
export const employeeKeys = {
    all: ["employees"] as const,
    list: () => [...employeeKeys.all, "list"] as const,
    byDepartment: (department?: string) => [...employeeKeys.all, "department", department] as const,
    details: (name: string) => [...employeeKeys.all, "details", name] as const,
};

export const organizationKeys = {
    all: ["organization"] as const,
    details: (companyName: string) => [...organizationKeys.all, "details", companyName] as const,
};

// Hook to create an employee
export const useCreateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (employeeData: {
            first_name: string;
            last_name: string;
            employee_name: string;
            company: string;
            email: string;
            gender: string;
            designation: string;
            role_profile: string;
            department: string;
            date_of_birth: string;
            date_of_joining: string;
            reports_to: string;
        }) => {
            return await createEmployee(employeeData);
        },
        onSuccess: () => {
            // Invalidate and refetch employees list if needed
            queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
        },
    });
};

// Hook to edit employee details
export const useEditEmployeeDetails = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ name, employeeData }: { 
            name: string; 
            employeeData: {
                employee_name: string;
                first_name: string;
                last_name: string;
                user_id: string;
                company_email: string;
                gender: string;
                date_of_birth: string;
                date_of_joining: string;
                designation: string;
                department: string;
                reports_to: string;
                role_profile: string;
            }
        }) => {
            return await editEmployeeDetails(name, employeeData);
        },
        onSuccess: (_, variables) => {
            // Invalidate and refetch employee details and list
            queryClient.invalidateQueries({ queryKey: employeeKeys.details(variables.name) });
            queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
            queryClient.invalidateQueries({ queryKey: employeeKeys.all });
        },
    });
};

// Hook to fetch employees
export const useGetEmployees = (department?: string) => {
    return useQuery({
        queryKey: employeeKeys.byDepartment(department),
        queryFn: () => getEmployees(department),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to fetch employee details
export const useGetEmployeeDetails = (name: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: employeeKeys.details(name),
        queryFn: () => getEmployeeDetails(name),
        enabled: enabled && !!name,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to fetch organization details
export const useGetOrganizationDetails = (companyName: string) => {
    return useQuery({
        queryKey: organizationKeys.details(companyName),
        queryFn: () => getOrganizationDetails(companyName),
        enabled: !!companyName,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
