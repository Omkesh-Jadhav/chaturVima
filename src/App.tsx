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
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import AssessmentQuestions from "./pages/AssessmentQuestions";
import Analytics from "./pages/Analytics";
import AssessmentReport from "./pages/AssessmentReport";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useUser();

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

const SettingsPage = () => (
  <div>
    <h1 className="text-3xl font-bold">Settings</h1>
    <p className="mt-4 text-gray-600">Settings page coming soon...</p>
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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/assessment/questions" element={<AssessmentQuestions />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/journey" element={<JourneyPage />} />
        <Route path="/assessment-report" element={<AssessmentReport />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
