/**
 * Main Layout Component
 * Wraps pages with sidebar navigation and navbar
 */
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSidebar } from "../../context/SidebarContext";

const Layout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 flex flex-col ${
          isCollapsed ? "ml-[80px]" : "ml-[280px]"
        }`}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
