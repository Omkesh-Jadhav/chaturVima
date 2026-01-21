import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDepartments, createDepartment } from "@/api/api-functions/organization-setup";
import type { Department } from "@/pages/superAdmin/Organization/types";

// Query keys
export const departmentKeys = {
    all: ["departments"] as const,
    list: () => [...departmentKeys.all, "list"] as const,
};

// Transform API response to Department interface
const transformDepartmentData = (apiData: any): Department[] => {
    if (!apiData?.message || !Array.isArray(apiData.message)) {
        return [];
    }

    return apiData.message
        .filter((dept: any) => dept.department_name !== "All Departments")
        .map((dept: any) => ({
            id: dept.name,
            name: dept.department_name,
            code: dept.custom_department_code || "",
            department_name: dept.department_name,
            custom_department_code: dept.custom_department_code,
            company: dept.company,
            custom_department_head: dept.custom_department_head,
            department_head_name: dept.department_head_name,
        }));
};

// Hook to fetch all departments
export const useDepartments = () => {
    return useQuery({
        queryKey: departmentKeys.list(),
        queryFn: async () => {
            const response = await getAllDepartments();
            return transformDepartmentData(response);
        },
    });
};

// Hook to create a department
export const useCreateDepartment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (departmentData: {
            department_name: string;
            custom_department_code: string;
            company: string;
            custom_department_head: string;
        }) => {
            return await createDepartment(departmentData);
        },
        onSuccess: () => {
            // Invalidate and refetch departments list
            queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
        },
    });
};
