
import {Link} from "react-router-dom";
import {
  Avatar,
  Dropdown,
  DropdownDivider,
  DropdownHeader,
  DropdownItem,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

import Logo from "../assets/logo.png";
import UserImage from "../assets/UserImage.png";

export default function NavbarComp() {
  return (
    <Navbar fluid rounded>
      <NavbarBrand href="#">
        <img src={Logo} className="mr-3 h-13 sm:h-13" alt="Logo" />
      </NavbarBrand>

      <div className="flex md:order-2 text-black">
        <Dropdown
          arrowIcon={false}
          inline
          label={
            <Avatar className="opacity-70"  alt="Imagen de usuario" img={UserImage} rounded />
          }
        >
          <DropdownHeader>
            <span className="block text-sm">Nombre de usuario</span>
            <span className="block truncate text-sm font-medium">name@gmail.com</span>
          </DropdownHeader>

          <DropdownItem>Perfil</DropdownItem>
          <DropdownItem>Administrar</DropdownItem>
          <DropdownItem>Ajustes</DropdownItem>
          <DropdownDivider />
          <DropdownItem> Iniciar Sesión</DropdownItem>
          <DropdownItem> Cerrar Sesión</DropdownItem>
        </Dropdown>
        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <Link className="text-[20px] px-2 rounded-[5px] hover: scale-110 hover:bg-[#668672]" to="/#"> Inicio</Link>
        <Link className="text-[20px] px-2 rounded-[5px] hover: scale-110 hover:bg-[#668672]" to="/productos">Productos</Link>
        <Link className="text-[20px] px-2 rounded-[5px] hover: scale-110 hover:bg-[#668672]" to="/#">Ofertas</Link>
        <Link className="text-[20px] px-2 rounded-[5px] hover: scale-110 hover:bg-[#668672]" to="/contactar">Contacto</Link>
      </NavbarCollapse>
    </Navbar>
  );
}
