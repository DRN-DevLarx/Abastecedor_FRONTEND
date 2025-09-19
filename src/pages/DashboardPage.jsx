import { useState } from "react";
import Sidebar from "../components/SideBar";
import { Menu } from "lucide-react";
import UserImage from "../assets/UserImage.png";

function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#0f172a] text-white">
      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0f172a88] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Header superior */}
      <div className="fixed top-0 left-0 w-full bg-[#1e293b] flex justify-between items-center px-5 py-3 z-30">
        {/* Botón menú (solo en móvil) */}
        {!sidebarOpen && (
          <button
            className="bg-[#1e293b] rounded-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        )}

        {/* Usuario */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-right">
            <h3 className="font-bold">Username</h3>
            <p className="text-gray-400">Administrador</p>
          </div>
          <img className="w-10 rounded-full border border-gray-600" src={UserImage} alt="user" />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
