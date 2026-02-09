import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDesignations, createDesignation } from "@/api/api-functions/organization-setup";

// Query keys
export const designationKeys = {
    all: ["designations"] as const,
    list: () => [...designationKeys.all, "list"] as const,
};

// Transform API response to string array of designation names
const transformDesignationData = (apiData: any): string[] => {
    if (!apiData?.data || !Array.isArray(apiData.data)) {
        return [];
    }

    return apiData.data
        .map((designation: any) => designation.name || "")
        .filter((name: string) => name && name.trim() !== "")
        .sort();
};

// Hook to fetch all designations
export const useDesignations = () => {
    return useQuery({
        queryKey: designationKeys.list(),
        queryFn: async () => {
            const response = await getAllDesignations();
            return transformDesignationData(response);
        },
    });
};

// Hook to create a designation
export const useCreateDesignation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (designationData: {
            designation_name: string;
        }) => {
            return await createDesignation(designationData);
        },
        onSuccess: () => {
            // Invalidate and refetch designations list
            queryClient.invalidateQueries({ queryKey: designationKeys.list() });
        },
    });
};
