// Main layout wrapper with sidebar navigation and navbar
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
          isCollapsed ? "ml-[80px]" : "ml-[240px]"
        }`}
      >
        <Navbar />
        <main className="flex-1 overflow-hidden relative">
          <div className="h-full w-full px-4 py-3 lg:px-6 lg:py-8 relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
