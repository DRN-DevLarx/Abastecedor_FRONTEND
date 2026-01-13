import Default_Image from "../assets/Default_Image.jpg";
import React, { useState, useEffect } from "react";
import Sidebar from "../components/SideBar";
import { Menu } from "lucide-react";

import { GetData } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import { AutenticatedUserData } from "../services/Token/AuthServices";

function DashboardPage() {

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const DefaultImage = Default_Image;
  const [UserName, setUserName] = useState("");
  const [UserImage, setUserImage] = useState();

  const access_token = getCookie("access_token");
  const Role = jwtDecode(access_token).role;

  const userQuery = AutenticatedUserData();

    useEffect(() => {
  
      if (userQuery.status === "success" && userQuery.data) {
        setUserName(userQuery.data.username);
      }
  
      const fetchData = async () => {
          
        const AditionalInfo = await GetData("informacionUsuarios/");
        
        // filtrar usuario por id
        const ID = userQuery.data?.id;
        const UserInfo = AditionalInfo.find(UInfo => UInfo.user === ID)        
        
        if (UserInfo) {
          
          if(!UserInfo.referenciaIMG) {
            setUserImage(DefaultImage);
          } else {
            setUserImage(UserInfo.referenciaIMG);
          }
        }

      }
      fetchData();
    }, [ userQuery.status, userQuery.data]);
    

  return (
    <div className=" flex h-screen text-white">
      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0  z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Header superior */}
      <div className="fixed top-0 left-0 w-full bg-[#adb6aa] dark:bg-gray-800 dark:text-[#CEC19F]  flex justify-between items-center px-5 py-3 z-20">
        {/* Botón menú (solo en móvil) */}
        {!sidebarOpen && (
          <button
            className=" rounded-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        )}

        {/* Usuario */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="text-right">
            <h3 className="font-bold"> {UserName} </h3>
            <p className="text-black dark:text-gray-400"> 
              {Role.includes("admin") && "Administrador"}
            </p>
          </div>
          <img className="w-10 h-10 rounded-full border border-gray-600" src={UserImage || DefaultImage} alt="user" />
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
