import Default_Image from "../assets/Default_Image.jpg";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { getCookie } from "../services/Token/sessionManager";
import Loader from "./Loader";
import { GetData, PostData } from "../services/ApiServices";


function UserCreate() {
  const navigate = useNavigate();
  const [ShowLoader, setShowLoader] = useState(false);

  const [UserNames, setUserNames] = useState("");
  const [UserEmails, setUsersEmails] = useState("");
  
  const access_token = getCookie("access_token");
  const CurrentUserName = jwtDecode(access_token).username;

  const [Role, setRole] = useState(2);
  const [Name, setName] = useState("");
  const [LastName, setLastName] = useState("");
  const [UserName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");
  const [Address, setAddress] = useState("");

  const DefaultImage = Default_Image;

  useEffect(() => {
      const fetchData = async () => {

          const UsersData = await GetData("users/");
          
          if (UsersData) {
              const Usernames = UsersData.map((user) => user.username);
              const Emails = UsersData.map((user) => user.email);

              setUserNames(Usernames);
              setUsersEmails(Emails);
          }
            
      };

      fetchData();
  }, []);

  // Reglas de validación
  const regexName = /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/; // Solo letras
  const regexUser = /^[A-Za-z0-9._-]+$/; // Usuario
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regexPhone = /^[0-9]+$/;


  const ValidateFields = () => {
    let message = ""

    if (!Name || Name.length < 3 || !regexName.test(Name)) {
      message = "El nombre debe tener al menos 3 letras.";
    } 
    
    else if (!LastName || LastName.length < 3 || !regexName.test(LastName)) {
      message = "El apellido debe tener al menos 3 letras.";
    } 
    
    else if (!UserName || UserName.length < 5 || !regexUser.test(UserName)) {
      message = "El usuario debe tener al menos 5 caracteres y solo usar letras, números o  _ -.";
    } 
    
    else if (UserNames.includes(UserName)) {
      message = "El nombre usuario no está disponible.";
    }

    else if (!Email || !regexEmail.test(Email)) {
      message = "El correo no tiene un formato válido.";
    } 

    else if (UserEmails.includes(Email)) {
      message = "El correo no está disponible.";
    }

    else if (Phone && (!regexPhone.test(Phone) || Phone.length < 8)) {
      message = "El teléfono debe contener solo números y mínimo 8 digitos si deseas agregarlo.";
    } 
    
    else if (Address && Address.length > 150) {
      message = "La dirección no puede superar los 150 caracteres";
    }

    if (message == "") {
      return true
    }

    Swal.fire({
      icon: "question",
      text: message,
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3B82F6",
      reverseButtons: true,
      background: "#233876aa",
      color: "white",
    })

    return false;
  };

  const handleCreateUser = () => {
    if (!ValidateFields()) return;

    Swal.fire({
      icon: "question",
      title: "¿Crear usuario?",
      text: "Verifica que los datos sean correctos antes de continuar.",
      showCancelButton: true,
      confirmButtonText: "Sí, crear",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#3B82F6",
      reverseButtons: true,
      background: "#233876aa",
      color: "white",
    }).then((result) => {
      if (result.isConfirmed) {
        PostNewUser()
      }
    });
  };

  const PostNewUser = async () => {

    let icon = "error";
    let title = "Error";
    let text = "No se pudo crear el usuario.";

    try {
      const response = await PostData("crearUsuario/", {
        username: UserName,
        first_name: Name,
        last_name: LastName,
        email: Email,
        telefono: Phone,
        direccion: Address,
        group_id: Role,
      });

      console.log(response.data.error);

      if (response.status === 200 || response.status === 201) {
        icon = "success";
        title = "Éxito";
        text = "Usuario creado correctamente.";

      } else {
        text = response.data.error;
      }
    } catch (error) {
      console.error("Error creando usuario:", error);
      text = "Si el error persiste, por favor contacte a soporte.";
    }

    Swal.fire({
      icon,
      title,
      text,
      background: "#233876aa",
      color: "white",
      timer: 3000,
    });
  };


  // const PostNewUser = async () => { 

  //   let icon = "error"
  //   let title = "Ha ocurrido un error"
  //   let text = "Si el error persiste, por favor contacte a soporte."

  //   setShowLoader(true);

  //   const responsePostNewUser = await PostData("users/", {
  //     username: UserName,
  //     first_name: Name,
  //     last_name: LastName,
  //     email: Email
  //   })

  //   console.log(responsePostNewUser);

  //   if(responsePostNewUser.status === 200 || responsePostNewUser.status === 201) {    
  //     const responseUsersInfo = await PostData("informacionUsuarios/", {
  //         user: responsePostNewUser.data.id,
  //         telefono: Phone,
  //         direccion: ""
  //     });

  //     console.log(responseUsersInfo);
      
  //     if (responseUsersInfo.status === 200 || responseUsersInfo.status === 201) {
  //       const responseUserGroup = await PostData("asignarGrupo/", {
  //           user_id: responsePostNewUser.data.id,
  //           group_id: Role,
  //       });

  //       console.log(responseUserGroup);
        
  //       if(responseUserGroup.status === 200 || responseUserGroup.status === 201) { 
  //         icon = "success"
  //         title = "Éxito"
  //         text = "Usuario creado correctamente."
  //       }
  //     }
  //   }

  //   setShowLoader(false)

  //   Swal.fire({
  //       icon: icon,
  //       title: title,
  //       text: text,
  //       background: '#233876aa',
  //       color: 'white',
  //       timer: 3000
  //   })

  //   if (icon == "success") {
  //     navigate("/usuarios")
  //   }
  // }


  return (
    <div className="bg-[#0f172a] min-h-screen sm:p-10 lg:px-40 p-5 text-white">
      {ShowLoader && <Loader />}

      <div className="bg-[#1e293b] p-6 sm:p-10 rounded-xl shadow flex flex-col md:flex-row items-center md:items-start gap-6 relative">
        {/* Avatar */}
        <div className="relative w-[80%] md:w-[40%] lg:w-[40%] mt-10">
          <div className=" relative mx-auto w-[90%] md:w-[70%] lg:w-[80%]">
            <img
              src={DefaultImage}
              alt="Imagen de usuario"
              className="mx-auto w-32 h-32 rounded-full border-4 border-[#334155] object-cover cursor-pointer"
            />
          </div>
        </div>

        {/* Formulario */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col col-span-1">
              <span className="font-medium">Nombre</span>
              <input
                className="p-2 inline rounded bg-[#334155] text-white"
                value={Name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex flex-col col-span-1">
              <span className="font-medium">Apellido</span>
              <input
                className="p-2 inline rounded bg-[#334155] text-white"
                value={LastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div className="flex flex-col col-span-1">
              <span className="font-medium">Usuario</span>
              <input
                className="p-2 rounded bg-[#334155] text-white"
                value={UserName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>

          <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="font-medium">Correo</span>
              <input
                className="p-2 rounded bg-[#334155] text-white"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <span className="font-medium">Teléfono (opcional)</span>
              <input
                className="p-2 rounded bg-[#334155] text-white"
                value={Phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="w-[100%] col-span-2">
            <span className="font-medium block">Dirección (opcional)</span>
            <textarea
              rows={3}
              className="p-2 rounded w-[100%] bg-[#334155] text-white resize-none border-0 focus:border-1"
              value={Address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
              onClick={() => navigate("/usuarios")}
            >
              Cancelar
            </button>
            <button
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg"
              onClick={handleCreateUser}
            >
              Crear usuario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserCreate;
