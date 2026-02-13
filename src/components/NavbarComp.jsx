
import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarToggle,
} from "flowbite-react";

import Default_Image from "../assets/Default_Image.jpg";
import Logo from "../assets/logo.png";
import {Link, useNavigate} from "react-router-dom";
import { getCookie, Logout, GenerateToken } from "../services/Token/sessionManager";
import { AutenticatedUserData } from "../services/Token/AuthServices";
import { GetData, PostData2 } from "../services/ApiServices";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { LogOutIcon, LucideLogIn, LucideShoppingCart, LucideUserRoundPen, Shield, User } from "lucide-react";

export default function NavbarComp() {
  
  const navigate = useNavigate()
  const [Autenticate, setAutenticate] = useState(false);
  const [ShowLoader, setShowLoader] = useState(false);
  
  const DefaultImage = Default_Image;
  const [Id, setId] = useState("");
  const [Username, setUsername] = useState("");
  const [UserImage, setUserImage] = useState("");
  const [IsAdmin, setIsAdmin] = useState(false);

  const access_token = getCookie("access_token");
  
  const userQuery = AutenticatedUserData(!!access_token);

  useEffect(() => {
    if (!userQuery) return; // si no hay token, no ejecutes nada
    
    if (userQuery.status === "success" && userQuery.data) {
      setAutenticate(true);
      setId(userQuery.data.id);
      setUsername(userQuery.data.username);

      if (userQuery.data.groups.includes(1)) {
        setIsAdmin(true);
      }

    }

    const fetchData = async () => {
      const GetUserInfo = await GetData("informacionUsuarios/");
      const CurrentUserID = userQuery.data.id;
      const CurrenteUserInfo = GetUserInfo.find(
        (CUInfo) => CUInfo.user === CurrentUserID
      );

      if (CurrenteUserInfo) {
        setUserImage(CurrenteUserInfo.referenciaIMG || DefaultImage);
      }
    };

    fetchData();
  }, [access_token, userQuery?.status, userQuery?.data]);


  const ViewProfile = async () => {
    
      const TOKEN = await GenerateToken({ id: Id, ViewUserAdmin: false }, "UserCookie");

      if(TOKEN) {
        navigate("/perfil")
      }
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
    <Navbar
      fluid
      rounded
      className="bg-[#adb6aa] dark:bg-gray-800 dark:text-[#CEC19F] py-0"
    >
      {ShowLoader && <Loader />}

      {/* Contenedor principal flex */}
      <div className="flex items-center justify-between w-full">

        
        {/* Menú hamburguesa SOLO en móvil */}
        <div className="flex items-center md:hidden">
          <NavbarToggle />
        </div>

        {/* Logo CENTRADO en móvil / Izquierda en desktop */}
        <NavbarBrand className="flex justify-center flex-1 min-[640px]:flex-none">
          <img
            src={Logo}
            className="h-16 w-auto dark:invert"
            alt="Logo"
          />
        </NavbarBrand>

        {/* Usuario + carrito */}
        {Autenticate ? (
          <div className="flex items-center gap-3 min-[640px]:order-1">
            <Dropdown
              arrowIcon={false}
              inline
              className="bg-[#adb6aa]"
              label={
                <Avatar
                  className="min-[640px]:relative"
                  alt="Imagen de usuario"
                  img={UserImage}
                  rounded
                />
              }
            >
                <>
                  <DropdownHeader>
                    <span className="block text-min-[640px]">Nombre de usuario</span>
                    <span className="block truncate text-min-[640px] font-medium">
                      {Username}
                    </span>
                  </DropdownHeader>

                  <div className="w-full" onClick={ViewProfile}>
                    <DropdownItem className="flex justify-center gap-1"> Mi Perfil <User size={20}/> </DropdownItem>
                  </div>

                  {IsAdmin && (
                    <Link to="/admin">
                      <DropdownItem className="flex justify-center gap-1"> Administrar <Shield size={20}/> </DropdownItem>
                    </Link>
                  )}

                  <DropdownDivider className="bg-gray-900" />
                  <DropdownItem onClick={CerrarSesion} className="flex justify-center gap-1"> Cerrar Sesión <LogOutIcon size={20}/> </DropdownItem>

                </>
              
            </Dropdown>

            <Link to="/carrito"
            className="flex items-center justify-center bg-gray-500 text-black hover:bg-black hover:text-white w-9 h-9 rounded-full p-1  dark:bg-gray-500 dark:text-black dark:hover:bg-gray-500 ">
              <LucideShoppingCart />
                <div className="absolute top-3 end-1 min-[640px]:end-3 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-[#38664e]  rounded-full dark:border-gray-900">
                  3
                </div>
            </Link>
                        
          </div>

        ) : (
          <div className="flex items-center gap-3 min-[640px]:order-1">
            <Dropdown
              arrowIcon={false}
              inline
              className="bg-[#adb6aa]"
              label={
                <Avatar
                  className="min-[640px]:relative"
                  alt="Imagen de usuario"
                  img={UserImage}
                  rounded
                />
              }
            >
                <div className="flex flex-col w-full">
                    <DropdownItem onClick={() => navigate("/registro")} className="flex justify-between gap-1"> Registrarse <LucideUserRoundPen size={20}/> </DropdownItem>

                    <DropdownItem onClick={() => navigate("/IniciarSesion")} className="flex justify-between gap-1"> Iniciar sesión <LucideLogIn size={20} /> </DropdownItem>
                </div>
              
            </Dropdown>                        
          </div>
        )}

      </div>

      {/* Colapso del menú */}
      <NavbarCollapse>
        <hr className="border-gray-900 dark:border-[#668672c1] md:hidden" />
        
        {!Autenticate ? (
          <div className="flex flex-col md:flex-row md:justify-around md:absolute md:mt-0
          md:w-[63%] min-[640px]:top-5  min-[640px]:left-[20%]
          lg:w-[63%]">

            <Link
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1] min-[640px]:mt-0" 
              to="/"> 
              Inicio
            </Link>

            <hr className="border-gray-900 dark:border-[#668672c1] md:hidden" />

            <Link
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]" 
              to="/about">
              Sobre nosotros
            </Link>

            <hr className="border-gray-900 dark:border-[#668672c1] md:hidden" />

            <Link
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]" 
              to="/productos">
              Productos
            </Link>

            <hr className="border-gray-900 dark:border-[#668672c1] md:hidden" />

            <Link 
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]" 
              to="/contactar">
              Contacto
            </Link>
            <hr className="border-gray-900 dark:border-[#668672c1] md:hidden" />
          </div>
        ) 

        : (
          <div className="flex flex-col md:flex-row md:absolute md:mt-0 md:top-5
          md:justify-center md:w-[63%] md:left-[20%] md:gap-5 lg:gap-10
          lg:w-[63%]">

            <Link
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1] min-[640px]:mt-0" 
              to="/"> 
              Inicio
            </Link>

            <hr className="border-gray-900 dark:border-[#668672c1] min-[640px]:hidden" />

            <Link
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1] min-[640px]:mt-0" 
              to="/principal"> 
              Principal
            </Link>

            <hr className="border-gray-900 dark:border-[#668672c1] min-[640px]:hidden" />

            <Link
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]" 
              to="/about">
              Sobre nosotros
            </Link>

            <hr className="border-gray-900 dark:border-[#668672c1] min-[640px]:hidden" />

            <Link 
              className="text-[17px] font-bold py-1 px-3 text-center rounded-[5px] hover:scale-110 hover:bg-[#668672c1]" 
              to="/contactar">
              Contacto
            </Link>
            <hr className="border-gray-900 dark:border-[#668672c1] min-[640px]:hidden" />
          </div>
        )}

      </NavbarCollapse>
    </Navbar>
  );
}
