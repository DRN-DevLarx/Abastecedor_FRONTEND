import React, { useState, useEffect } from "react";
import { X, ChartAreaIcon, MessageCircle, Settings, LogOut, ArrowLeft, Users2, ShoppingCartIcon, Truck, Layers } from "lucide-react";
import { Logout } from "../services/Token/sessionManager";
import Statistics from "./Statistics";
import UsersList from "./UsersList";
import Messages from "./Messages";
import ProductsList from "./ProductsList";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

function Sidebar({ sidebarOpen, setSidebarOpen }) {

  const navigate = useNavigate()
  const [ShowLoader, setShowLoader] = useState(false);

  const [activeMenu, setActiveMenu] = useState("Statistics");
  const [currentComponent, setCurrentComponent] = useState(<Statistics />);

  const menuItems = [
    { name: "Estadísticas", icon: <ChartAreaIcon size={18} />, component: <Statistics /> },
    { name: "Usuarios", icon: <Users2 size={18} />, component: <UsersList /> },
    { name: "Productos", icon: <Layers size={18} />, component: <ProductsList /> },
    { name: "Pedidos", icon: <Truck size={18} />, component: <ProductsList /> },
    { name: "Ventas", icon: <ShoppingCartIcon size={18} />, component: <ProductsList /> },
    { name: "Mensajes", icon: <MessageCircle size={18} />, component: <Messages /> },
    { name: "Ajustes", icon: <Settings size={18} />, component: <div className="pt-10">Ajustes</div> },
  ];
  
  // Recuperar menú activo al montar
  useEffect(() => {
    const savedMenu = localStorage.getItem("activeMenu");
    if (savedMenu) {
      const item = menuItems.find((i) => i.name === savedMenu);
      if (item) {
        setActiveMenu(item.name);
        setCurrentComponent(item.component);
      }
    }
  }, []);

  // Guardar menú activo y actualizar componente
  const handleClick = (item) => {
    setActiveMenu(item.name);
    setCurrentComponent(item.component);
    setSidebarOpen(false)
    localStorage.setItem("activeMenu", item.name);
  };

  const Back = () => {
    document.cookie = "ProductsCookie=; path=/; max-age=0; secure; SameSite=Strict";
    navigate("/principal")
  }

  const CerrarSesion = () => {
    setShowLoader(true); // mostrar loader

    setTimeout(() => {
      setShowLoader(false); // ocultar loader      
      navigate("/IniciarSesion");
      Logout()
    }, 1500);
  };

  return (
    <>

      {ShowLoader && (
          <Loader/>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-[#83917f7c] dark:bg-[#05052f8c] backdrop-blur-md dark:text-[#CEC19F] fixed inset-y-0 left-0 text-white w-64 p-4 transform lg:translate-x-0 transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-around mb-5">

          <button 
          onClick ={Back}
          className="flex gap-1 items-center hover:scale-110"
          >
            <ArrowLeft size={24} />
          <h1 className="text-2xl font-bold">Administración</h1>
          </button >

        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleClick(item)}
              className={`flex items-center gap-3 p-2 w-full text-left rounded-lg hover:bg-[#62676dc9] ${
                activeMenu === item.name ? "bg-[#62676dc9]" : ""
              }`}
            >
              {item.icon} {item.name}
            </button>
          ))}
          <hr className="my-0" />
          <button 
          onClick={CerrarSesion}
          className={"flex items-center gap-3 mt-1 p-2 w-full text-left rounded-lg bg-[#af172987] hover:bg-[#af1729]"}>

            <LogOut size={18} />
            Cerrar sesión
          </button>
        </nav>
      </aside>

      {/* Renderizado del componente activo */}
      <main className="bg-[#adb6aaa8] dark:bg-[#171731] w-60% flex-1 mt-15 border-l-1 border-gray-300 overflow-y-auto lg:ml-64">
        {currentComponent}
      </main>
    </>
  );
}

export default Sidebar;
