import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createEmployee, getEmployees } from "@/api/api-functions/organization-setup";

// Query keys
export const employeeKeys = {
    all: ["employees"] as const,
    list: () => [...employeeKeys.all, "list"] as const,
    byDepartment: (department?: string) => [...employeeKeys.all, "department", department] as const,
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
            reportingTo: string;
        }) => {
            return await createEmployee(employeeData);
        },
        onSuccess: () => {
            // Invalidate and refetch employees list if needed
            queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
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
