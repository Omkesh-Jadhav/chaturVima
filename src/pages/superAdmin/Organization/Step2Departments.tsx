import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Department } from "./types";
import { Button, Input } from "@/components/ui";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/useDepartments";


interface Step2DepartmentsProps {
  departments: Department[];
  onUpdate: (departments: Department[]) => void;
}

const Step2Departments: React.FC<Step2DepartmentsProps> = ({
  departments,
  onUpdate,
}) => {
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [departmentHead, setDepartmentHead] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  // React Query hooks
  const { data: fetchedDepartments = [], isLoading: isFetchingDepartments } = useDepartments();
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  const handleAddDepartment = async () => {
    if (!departmentName.trim()) return;

    try {
      const departmentData = {
        department_name: departmentName.trim(),
        custom_department_code: departmentCode.trim() || `DEPT_${Date.now()}`,
        company: "Chaturvima", // You can make this dynamic if needed
        custom_department_head: departmentHead.trim() || ""
      };

      await createDepartmentMutation.mutateAsync(departmentData);

      // Clear form fields on success
      setDepartmentName("");
      setDepartmentCode("");
      setDepartmentHead("");
    } catch (error) {
      console.error("Failed to create department:", error);
      // You might want to show a toast notification here
    }
  };

  const handleEditDepartment = (id: string) => {
    const department = departments.find((d) => d.id === id);
    if (department) {
      setDepartmentName(department.name);
      setDepartmentCode(department.code);
      setDepartmentHead(department.custom_department_head || "");
      setEditingId(id);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!departmentName.trim() || !editingId) return;

    try {
      const departmentData = {
        name: editingId, // name is treated as id
        department_name: departmentName.trim(),
        custom_department_code: departmentCode.trim(),
        company: "Chaturvima",
        custom_department_head: departmentHead.trim() || ""
      };

      await updateDepartmentMutation.mutateAsync(departmentData);

      // Clear form fields on success
      setDepartmentName("");
      setDepartmentCode("");
      setDepartmentHead("");
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update department:", error);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    // Find department from the actual displayed list
    const allDepartments = fetchedDepartments.length > 0 ? fetchedDepartments : departments;
    const department = allDepartments.find((dept) => dept.id === id);
    
    if (!department) return;

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to delete the department "${department.name}"?`);
    if (!confirmed) return;

    try {
      // Call API to delete department using department name/ID
      await deleteDepartmentMutation.mutateAsync(department.id);

      // Update local state by removing the department
      const updatedDepartments = departments.filter((dept) => dept.id !== id);
      onUpdate(updatedDepartments);
    } catch (error) {
      console.error("Failed to delete department:", error);
      // You might want to show a toast notification here
    }
  };

  const cancelEdit = () => {
    setDepartmentName("");
    setDepartmentCode("");
    setDepartmentHead("");
    setEditingId(null);
  };

  // Update parent component when fetched departments change
  useEffect(() => {
    if (fetchedDepartments.length > 0) {
      onUpdate(fetchedDepartments);
    }
  }, [fetchedDepartments, onUpdate]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Department Setup
      </h2>

      {isFetchingDepartments && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-sm text-blue-700">Loading departments...</span>
          </div>
        </div>
      )}

      {/* Delete Error State */}
      {deleteDepartmentMutation.error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">
            Failed to delete department. Please try again.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Name
          </label>
          <Input
            type="text"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="e.g., Sales & Marketing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Code (Optional)
          </label>
          <Input
            type="text"
            value={departmentCode}
            onChange={(e) => setDepartmentCode(e.target.value)}
            placeholder="e.g., PROD, SALES"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Head (Optional)
          </label>
          <Input
            type="text"
            value={departmentHead}
            onChange={(e) => setDepartmentHead(e.target.value)}
            placeholder="e.g., John Doe"
          />
        </div>
      </div>

      <div className="mb-6">
        {editingId ? (
          <div className="flex gap-2">
            <Button
              onClick={handleUpdateDepartment}
              variant="gradient"
              size="sm"
              disabled={updateDepartmentMutation.isPending || !departmentName.trim()}
            >
              {updateDepartmentMutation.isPending ? "Updating..." : "Update Department"}
            </Button>
            <Button onClick={cancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddDepartment}
            variant="gradient"
            size="sm"
            disabled={createDepartmentMutation.isPending || !departmentName.trim()}
          >
            <Plus className="w-4 h-4" />
            {createDepartmentMutation.isPending ? "Adding..." : "Add Department"}
          </Button>
        )}
      </div>

      {departments.length > 0 && (
        <div className="mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {department.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {department.code || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditDepartment(department.id)}
                          variant="ghost"
                          size="xs"
                          className="text-blue-600 hover:text-blue-800 p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteDepartment(department.id)}
                          variant="ghost"
                          size="xs"
                          className="text-red-600 hover:text-red-800 p-1"
                          disabled={deleteDepartmentMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2Departments;
