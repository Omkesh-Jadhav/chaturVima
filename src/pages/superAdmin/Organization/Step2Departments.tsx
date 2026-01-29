import React, { useEffect, useState } from "react";
import { Edit, Trash2, Plus, Building2, Check, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Department } from "./types";
import { Button, Input, Card } from "@/components/ui";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "@/hooks/useDepartments";
import { cn } from "@/utils/cn";


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
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ isOpen: boolean; departmentId: string | null; departmentName: string }>({
    isOpen: false,
    departmentId: null,
    departmentName: "",
  });
  const [deleteError, setDeleteError] = useState<string>("");

  // React Query hooks
  const { data: fetchedDepartments = [], isLoading: isFetchingDepartments } = useDepartments();
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  const validateDepartmentName = (name: string): boolean => {
    return /^[^0-9]*$/.test(name.trim());
  };

  const handleDepartmentNameChange = (value: string) => {
    if (validateDepartmentName(value) || value === "") {
      setDepartmentName(value);
    }
  };

  const handleAddDepartment = async () => {
    if (!departmentName.trim() || !validateDepartmentName(departmentName)) return;

    try {
      const departmentData = {
        department_name: departmentName.trim(),
        custom_department_code: departmentCode.trim(),
        company: "Chaturvima",
        custom_department_head: departmentHead.trim() || ""
      };

      await createDepartmentMutation.mutateAsync(departmentData);

      setDepartmentName("");
      setDepartmentCode("");
      setDepartmentHead("");
    } catch (error) {
      console.error("Failed to create department:", error);
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
    if (!departmentName.trim() || !editingId || !validateDepartmentName(departmentName)) return;

    try {
      const departmentData = {
        name: editingId,
        department_name: departmentName.trim(),
        custom_department_code: departmentCode.trim(),
        company: "Chaturvima"
      };

      await updateDepartmentMutation.mutateAsync(departmentData);

      setDepartmentName("");
      setDepartmentCode("");
      setDepartmentHead("");
      setEditingId(null);
    } catch (error) {
      console.error("Failed to update department:", error);
    }
  };

  const handleDeleteClick = (id: string) => {
    const allDepartments = fetchedDepartments.length > 0 ? fetchedDepartments : departments;
    const department = allDepartments.find((dept) => dept.id === id);
    
    if (department) {
      setDeleteError("");
      setDeleteConfirmModal({
        isOpen: true,
        departmentId: id,
        departmentName: department.name,
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmModal.departmentId) return;

    setDeleteError("");

    try {
      await deleteDepartmentMutation.mutateAsync(deleteConfirmModal.departmentId);
      const updatedDepartments = departments.filter((dept) => dept.id !== deleteConfirmModal.departmentId);
      onUpdate(updatedDepartments);
      setDeleteConfirmModal({ isOpen: false, departmentId: null, departmentName: "" });
    } catch (error: unknown) {
      console.error("Failed to delete department:", error);
      
      const errorData = error as { response?: { data?: { exc_type?: string } }; exc_type?: string };
      
      if (errorData?.response?.data?.exc_type === "LinkExistsError" || errorData?.exc_type === "LinkExistsError") {
        setDeleteError("This department has employees assigned, so it cannot be deleted.");
      }
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
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Department Setup</h2>
            <p className="text-xs text-gray-500 mt-0.5">Manage your organization departments</p>
          </div>
          {departments.length > 0 && (
            <div className="px-3 py-1.5 bg-gradient-to-r from-brand-teal to-brand-navy text-white rounded-lg shadow-sm">
              <span className="text-xs font-semibold">{departments.length} Department{departments.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {isFetchingDepartments && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
              <span className="text-xs text-blue-700 font-medium">Loading departments...</span>
            </div>
          </motion.div>
        )}

        <Card variant="elevated" className="p-4 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Department Name
              </label>
              <Input
                type="text"
                value={departmentName}
                onChange={(e) => handleDepartmentNameChange(e.target.value)}
                placeholder="e.g., Sales & Marketing"
                className="w-full h-9"
              />
            </div>
            <div className="flex-1 max-w-md">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Department Code
              </label>
              <Input
                type="text"
                value={departmentCode}
                onChange={(e) => setDepartmentCode(e.target.value)}
                placeholder="e.g., SALES, HR"
                className="w-full h-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {editingId ? (
                <>
                  <Button
                    onClick={handleUpdateDepartment}
                    variant="gradient"
                    size="sm"
                    disabled={updateDepartmentMutation.isPending || !departmentName.trim() || !validateDepartmentName(departmentName)}
                    className="min-w-[110px] h-9 text-xs"
                  >
                    {updateDepartmentMutation.isPending ? (
                      <span className="flex items-center gap-1.5">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Updating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Update
                      </span>
                    )}
                  </Button>
                  <Button 
                    onClick={cancelEdit} 
                    variant="outline" 
                    size="sm"
                    className="min-w-[85px] h-9 text-xs"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleAddDepartment}
                  variant="gradient"
                  size="sm"
                  disabled={createDepartmentMutation.isPending || !departmentName.trim() || !validateDepartmentName(departmentName)}
                  className="min-w-[140px] h-9 text-xs"
                >
                  {createDepartmentMutation.isPending ? (
                    <span className="flex items-center gap-1.5">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Adding...
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      Add Department
                    </span>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {departments.length > 0 ? (
          <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <AnimatePresence mode="popLayout">
                {departments.map((department, index) => (
                  <motion.div
                    key={department.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <Card
                      variant="elevated"
                      className={cn(
                        "transition-all hover:shadow-md hover:border-brand-teal/50 h-full bg-white",
                        editingId === department.id && "ring-2 ring-brand-teal border-brand-teal"
                      )}
                    >
                      <div className="p-2.5">
                        <div className="flex justify-center mb-1.5">
                          <div className="p-2.5 bg-gradient-to-br from-brand-teal to-brand-navy rounded-xl shadow-sm">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <h3 className="font-semibold text-sm text-gray-900 mb-0.5 text-center line-clamp-2 min-h-9">
                          {department.name}
                        </h3>
                        {department.code && (
                          <p className="text-xs text-gray-500 text-center mb-1.5">{department.code}</p>
                        )}
                        <div className="flex items-center justify-center gap-1.5 pt-1.5 border-t border-gray-100">
                          <Button
                            onClick={() => handleEditDepartment(department.id)}
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                          >
                            <Edit className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                          <div className="w-px h-5 bg-gray-200"></div>
                          <Button
                            onClick={() => handleDeleteClick(department.id)}
                            variant="ghost"
                            size="sm"
                            className="flex-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                            disabled={deleteDepartmentMutation.isPending}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Building2 className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No Departments Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Get started by adding your first department using the form above.
            </p>
          </motion.div>
        )}
      </div>

      {deleteConfirmModal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setDeleteConfirmModal({ isOpen: false, departmentId: null, departmentName: "" })}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Delete Department</h2>
                  <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone</p>
                </div>
              </div>

              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-gray-700">
                  Are you sure you want to delete <span className="font-semibold text-gray-900">"{deleteConfirmModal.departmentName}"</span>?
                </p>
              </div>

              {deleteError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-orange-800 font-medium">{deleteError}</p>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDeleteError("");
                    setDeleteConfirmModal({ isOpen: false, departmentId: null, departmentName: "" });
                  }}
                  size="sm"
                  className="flex-1 cursor-pointer border-gray-300 hover:bg-gray-50 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleConfirmDelete}
                  size="sm"
                  disabled={deleteDepartmentMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs"
                >
                  {deleteDepartmentMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Step2Departments;
