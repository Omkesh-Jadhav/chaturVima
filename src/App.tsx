/**
 * Main App Component
 * Routes and authentication wrapper
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider, useUser } from "./context/UserContext";
import { AssessmentProvider } from "./context/AssessmentContext";
import { SidebarProvider } from "./context/SidebarContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Employee/Assessment/AssessmentDashboard";
import Assessment from "./pages/Employee/Assessment/Assessment";
import AssessmentQuestions from "./pages/Employee/Assessment/AssessmentQuestions";
import AssessmentReport from "./pages/Employee/Assessment/AssessmentReport";
import OrganizationSetup from "./pages/superAdmin/Organization/OrganizationSetup";
import EmployeeSetup from "./pages/superAdmin/Employee/EmployeeSetup";
import DepartmentSetup from "./pages/superAdmin/Department/DepartmentSetup";
// import SuperAdminDashboard from "./pages/superAdmin/Dashboard/SuperAdminDashboard";
import Settings from "./pages/Settings/Settings";
import EditProfile from "./pages/Settings/EditProfile";
import HRAssessmentCycles from "./pages/hrAdmin/AssessmentCycles/AssessmentCycles";
import HrAdminDashboard from "./pages/hrAdmin/hrAdminDashboard/hrAdminDashboard";
import DepartmentHeadAssessmentCycles from "./pages/departmentHead/AssessmentCycles/DepartmentAssessmentCycles";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useUser();

  // Wait for auth check to complete before redirecting
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
        <Route path="/assessment-dashboard" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/assessment/questions" element={<AssessmentQuestions />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/assessment-report" element={<AssessmentReport />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/edit-profile" element={<EditProfile />} />
        <Route path="/organization-setup" element={<OrganizationSetup />} />
        <Route path="/employee-setup" element={<EmployeeSetup />} />
        <Route path="/department-setup" element={<DepartmentSetup />} />
        <Route path="/hr/assessment-cycles" element={<HRAssessmentCycles />} />
        <Route path="/hr/dashboard" element={<HrAdminDashboard />} />
        <Route
          path="/department-head/assessment-cycles"
          element={<DepartmentHeadAssessmentCycles />}
        />
        {/* <Route
          path="/super-admin-dashboard"
          element={<SuperAdminDashboard />}
        /> */}
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route
        path="/"
        element={<Navigate to="/assessment-dashboard" replace />}
      />

      {/* 404 fallback */}
      <Route
        path="*"
        element={<Navigate to="/assessment-dashboard" replace />}
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
