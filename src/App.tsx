/**
 * Main App Component
 * Routes and authentication wrapper
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { UserProvider, useUser } from "./context/UserContext";
import { AssessmentProvider } from "./context/AssessmentContext";
import { SidebarProvider } from "./context/SidebarContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Employee/Assessment/AssessmentDashboard";
import Assessment from "./pages/Employee/Assessment/Assessment";
import AssessmentQuestions from "./pages/Employee/Assessment/AssessmentQuestions";
import Analytics from "./pages/Analytics";
import AssessmentReport from "./pages/Employee/Assessment/AssessmentReport";
import OrganizationSetup from "./pages/superAdmin/Organization/OrganizationSetup";
import EmployeeSetup from "./pages/superAdmin/Employee/EmployeeSetup";
import DepartmentSetup from "./pages/superAdmin/Department/DepartmentSetup";
import SuperAdminDashboard from "./pages/superAdmin/Dashboard/SuperAdminDashboard";
import Settings from "./pages/Settings/Settings";
import EditProfile from "./pages/Settings/EditProfile";
import type { UserRole } from "./types";
import { getDefaultRouteForRole } from "./config/roleRoutes";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleRoute = ({
  allowedRoles,
  children,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
}) => {
  const { user } = useUser();
  if (!user) {
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

// Placeholder pages for routes

const TeamPage = () => (
  <div>
    <h1 className="text-3xl font-bold">Team View</h1>
    <p className="mt-4 text-gray-600">Team view page coming soon...</p>
  </div>
);

const OrganizationPage = () => (
  <div>
    <h1 className="text-3xl font-bold">Organization</h1>
    <p className="mt-4 text-gray-600">Organization page coming soon...</p>
  </div>
);

const JourneyPage = () => (
  <div>
    <h1 className="text-3xl font-bold">Journey Timeline</h1>
    <p className="mt-4 text-gray-600">Journey timeline page coming soon...</p>
  </div>
);

function AppRoutes() {
  const { user, isAuthenticated } = useUser();

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <AssessmentProvider>
                <Layout />
              </AssessmentProvider>
            </SidebarProvider>
          </ProtectedRoute>
        }
      >
        <Route
          path="/assessment-dashboard"
          element={
            <RoleRoute allowedRoles={["employee"]}>
              <Dashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/assessment"
          element={
            <RoleRoute allowedRoles={["employee"]}>
              <Assessment />
            </RoleRoute>
          }
        />
        <Route
          path="/assessment/questions"
          element={
            <RoleRoute allowedRoles={["employee"]}>
              <AssessmentQuestions />
            </RoleRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <RoleRoute allowedRoles={["employee"]}>
              <Analytics />
            </RoleRoute>
          }
        />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route
          path="/assessment-report"
          element={
            <RoleRoute allowedRoles={["employee"]}>
              <AssessmentReport />
            </RoleRoute>
          }
        />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/edit-profile" element={<EditProfile />} />
        <Route
          path="/organization-setup"
          element={
            <RoleRoute allowedRoles={["super-admin"]}>
              <OrganizationSetup />
            </RoleRoute>
          }
        />
        <Route
          path="/employee-setup"
          element={
            <RoleRoute allowedRoles={["super-admin"]}>
              <EmployeeSetup />
            </RoleRoute>
          }
        />
        <Route
          path="/department-setup"
          element={
            <RoleRoute allowedRoles={["super-admin"]}>
              <DepartmentSetup />
            </RoleRoute>
          }
        />
        <Route
          path="/super-admin-dashboard"
          element={
            <RoleRoute allowedRoles={["super-admin"]}>
              <SuperAdminDashboard />
            </RoleRoute>
          }
        />
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRouteForRole(user?.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 fallback */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRouteForRole(user?.role)} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <AppRoutes />
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
