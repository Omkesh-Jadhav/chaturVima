import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import type { Department } from "./types";
import { Button, Input } from "@/components/ui";
import { getAllDepartments } from "@/api/api-functions/organization-setup";


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
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddDepartment = () => {
    if (!departmentName.trim()) return;

    const newDepartment: Department = {
      id: Date.now().toString(),
      name: departmentName.trim(),
      code: departmentCode.trim(),
    };

    const updatedDepartments = [...departments, newDepartment];
    onUpdate(updatedDepartments);
    setDepartmentName("");
    setDepartmentCode("");
  };

  const handleEditDepartment = (id: string) => {
    const department = departments.find((d) => d.id === id);
    if (department) {
      setDepartmentName(department.name);
      setDepartmentCode(department.code);
      setEditingId(id);
    }
  };

  const handleUpdateDepartment = () => {
    if (!departmentName.trim() || !editingId) return;

    const updatedDepartments = departments.map((dept) =>
      dept.id === editingId
        ? { ...dept, name: departmentName.trim(), code: departmentCode.trim() }
        : dept
    );

    onUpdate(updatedDepartments);
    setDepartmentName("");
    setDepartmentCode("");
    setEditingId(null);
  };

  const handleDeleteDepartment = (id: string) => {
    const updatedDepartments = departments.filter((dept) => dept.id !== id);
    onUpdate(updatedDepartments);
  };

  const cancelEdit = () => {
    setDepartmentName("");
    setDepartmentCode("");
    setEditingId(null);
  };

  useEffect(() => {
    getAllDepartments();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">
        Department Setup
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
            // className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-stages-self-reflection"
            placeholder="e.g., PROD, SALES"
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
            >
              Update Department
            </Button>
            <Button onClick={cancelEdit} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={handleAddDepartment} variant="gradient" size="sm">
            <Plus className="w-4 h-4" />
            Add Department
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
                    Department Nameeeeee
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
