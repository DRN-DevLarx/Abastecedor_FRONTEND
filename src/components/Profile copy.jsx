import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ArrowLeft, Bell, BellOff, Moon, MoonIcon, Sun } from "lucide-react";
import { AutenticateUser, AutenticatedUserData } from "../services/Token/AuthServices";
import { GetData, PostData, PatchData, DeleteData } from "../services/ApiServices";
import cloudDinaryServices from '../services/cloudDinaryServices';
import { getCookie } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Loader from "./Loader"
import { useQueryClient } from "@tanstack/react-query";
import { Tooltip } from "recharts";

function Profile() {
  const navigate = useNavigate()
  const queryClient = useQueryClient();

  const [ShowLoader, setShowLoader] = useState(false);  
  const [FullUserData, setFullUserData] = useState([]);  
  const [OriginalData, setOriginalData] = useState({});

  const [IdUser, setIdUser] = useState(0);
  const [Name, setName] = useState("");
  const [LastName, setLastName] = useState("");
  const [UserName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");
  const [Address, setAddress] = useState("");
  const [Joined, setJoined] = useState("");
  
  const [Groups, setGroups] = useState([]);

  const DefaultImage = "https://res.cloudinary.com/dateuzds4/image/upload/v1758219782/jpxfnohhrbfkox7sypjl.jpg";
  
  const [UserImage, setUserImage] = useState("");
  const [ImagePreview, setImagePreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para los botones
  const [NotificationsOn, setNotificationsOn] = useState(false);
  const [Tooltip, setTooltip] = useState(false);
  const [Tooltip2, setTooltip2] = useState(false);
  
  const [DarkMode, setDarkMode] = useState();
  const [TextTooltip, setTextTooltip] = useState("");
  const [TextTooltip2, setTextTooltip2] = useState("");

  const access_token = getCookie("access_token");
  const CurrentRole = jwtDecode(access_token).role;
  const [Role, setRole] = useState(CurrentRole);

  const userQuery = AutenticatedUserData();

  useEffect(() => {

    if(NotificationsOn) {
      setTextTooltip("activadas")
    } else {      
      setTextTooltip("desactivadas")
    } 

    if(DarkMode) {
      setTextTooltip2("oscuro")
    } else {      
      setTextTooltip2("normal")
    }

  }, [NotificationsOn, DarkMode])

  useEffect(() => {

    if (userQuery.status === "success" && userQuery.data) {
      setIdUser(userQuery.data.id) 
      setName(userQuery.data.first_name);
      setLastName(userQuery.data.last_name);
      setEmail(userQuery.data.email);
      setUserName(userQuery.data.username);
      setJoined(userQuery.data.date_joined);
    }

    const fetchData = async () => {


      const UserData = await GetData("users/");
      setFullUserData(UserData)

      const GroupsData = await GetData("grupos/");
      const GroupsName = GroupsData.map((group) => group.name);
      setGroups(GroupsName)

      const AditionalInfo = await GetData("informacionUsuarios/");
      
      // filtrar usuario por id
      const ID = userQuery.data.id;
      const UserInfo = AditionalInfo.find(UInfo => UInfo.user === ID)

      
      if (UserInfo) {
        setPhone(UserInfo.telefono);
        setAddress(UserInfo.direccion);
        setUserImage(UserInfo.referenciaIMG);
        
        if(!UserInfo.referenciaIMG) {
          setUserImage(DefaultImage);
        }
                
        if(UserInfo.notificaciones === true) {
          setNotificationsOn(true)
        }

        if(UserInfo.tema === "oscuro") {
          setDarkMode(true)

        } else if (UserInfo.tema === "normal") {
          setDarkMode(false)
        }
      }
    }

    fetchData();
  }, [ userQuery.status, userQuery.data]);
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {
        Swal.fire({
          icon: 'error',
          title: 'Formato no permitido',
          text: 'Solo se permiten archivos JPG, JPEG, PNG o WEBP.',
          background: '#233876aa',
          color: 'white',
          showConfirmButton: false,
          timer: 3500,
        });
    
        e.target.value = ''; // Limpia el input
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      setUserImage(file);
    }
  };

  const DeleteAccount = async () => {
    Swal.fire({
      icon: "warning",
      iconColor: "red",
      title: "¿Estás seguro que deseas eliminar la cuenta?",
      text: "Esta acción es irreversible.",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: "Sí, eliminar",
      confirmButtonColor: "red",
      background: "#233876aa",
      color: "white",
    }).then((result) => {
      
      if (result.isConfirmed) {
        EnterPassword(DeleteContinue)
      }
    });
  };

  const EnterPassword = async (NexFunction) => {
    
    let ButtonText = "Aceptar"
    let ButtonColor = "#3B82F6"
    
    if(NexFunction == DeleteContinue) {
      ButtonText = "Eliminar"
      ButtonColor = "red"
      
    } else if (NexFunction == UpdateProfile) {
      ButtonText = "Actualizar"
      
    } else if (NexFunction == RequestCode) {
      ButtonText = "Verificar"
    }

    Swal.fire({
      title: "Ingresa tu contraseña para continuar",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonText: ButtonText,
      confirmButtonColor: ButtonColor,
      background: "#233876aa",
      color: "white",
      html: `
        <div class="h-16 w-full relative">
          <input 
            type="password" 
            id="swalPassword" 
            class="p-2 w-[60%] bg-transparent rounded-[5px] border border-gray-500 text-white" 
            placeholder="Contraseña"
          />
          <button 
            type="button" 
            id="togglePassword" 
            class="absolute top-[10px] right-[23%] text-gray-400 hover:text-white"
          >
            <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
              <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
              <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
            </svg>
          </button>
        </div>
      `,
      didOpen: () => {
        const passInput = Swal.getPopup().querySelector('#swalPassword');
        const toggleBtn = Swal.getPopup().querySelector('#togglePassword');
        const eyeIcon = Swal.getPopup().querySelector('#eyeIcon');
        let showing = false;

        toggleBtn.addEventListener('click', () => {
          showing = !showing;
          passInput.type = showing ? "text" : "password";
          eyeIcon.outerHTML = showing
            ? `<svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/></svg>`
            : `<svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/></svg>`;
        });
      },
      preConfirm: () => {
        const password = Swal.getPopup().querySelector('#swalPassword').value;
        if (!password) {
          Swal.showValidationMessage("Debes ingresar la contraseña");
          return false; // evita que se cierre
        }
        return password;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        const password = result.value;
        
        NexFunction(password)
      }
    });
  }

  const ValidatePassword = async (password) => {
    
    setShowLoader(true);    

    const endpoint = "token/";
    const responseLogin = await AutenticateUser(endpoint, {
        username: UserName,
        password: password,
      });
      
      setShowLoader(false);    
    
      if (responseLogin.status == 200) {    
        return true
        
      } else {
        return false
      }
  }

  const DeleteContinue = async (password) => {

    const IsCorrect = await ValidatePassword(password)  
    
    if (!IsCorrect) {
      Swal.fire({
        icon: 'error',
        text: "La contraseña es incorrecta. Intentalo más tarde.",
        showConfirmButton: false,
        background: '#233876aa',
        color: 'white',
        timer: 3000
      })
    } else {    
      setShowLoader(true)
      // const endpointDelete= "eliminarUsuario/"
      // const responseDeleteUser = await DeleteData(endpointDelete, IdUser)
            
      setShowLoader(false)

      const responseDeleteUser = 200

      if(responseDeleteUser === 200) {
        Swal.fire({
          icon: 'success',
          text: "La cuenta se ha eliminado correctamente.",
          showConfirmButton: false,
          showCancelButton: false,
          background: '#233876aa',
          color: 'white',
          timer: 3000
        })
        setTimeout(() => {
          navigate("/IniciarSesion")
        }, 3000);
      }
      
    }


  }

  const EditMode = () => {
    setOriginalData({
      UserImage,
      ImagePreview,
      NotificationsOn,
      DarkMode,
      Name,
      LastName,
      UserName,
      Email,
      Phone,
      Role,
      Address,

    });
    setIsEditing(true);
  }
  
  const CancelEdit = () => {
    setUserImage(OriginalData.UserImage);
    setImagePreview(OriginalData.ImagePreview);
    setNotificationsOn(OriginalData.NotificationsOn);
    setDarkMode(OriginalData.DarkMode);

    setName(OriginalData.Name);
    setLastName(OriginalData.LastName);
    setUserName(OriginalData.UserName);
    setEmail(OriginalData.Email);
    setPhone(OriginalData.Phone);
    setRole(OriginalData.Role)
    setAddress(OriginalData.Address);

    setIsEditing(false);
  }

  const EditSave = async () => {

    if(UserImage === OriginalData.UserImage && NotificationsOn === OriginalData.NotificationsOn && DarkMode === OriginalData.DarkMode 
      && Name === OriginalData.Name && LastName === OriginalData.LastName && UserName === OriginalData.UserName 
      && Email == OriginalData.Email && Phone == OriginalData.Phone && Address == OriginalData.Address
     ) 
     {} else if(Name.length == 0 || LastName.length == 0 || UserName.length == 0 || Email.length == 0 ) {
      Swal.fire({
          icon: 'error',
          text: 'Por favor completa los campos obligatorios.',
          confirmButtonText: 'Verificar',
          confirmButtonColor: '#3B82F6',
          background: '#233876aa',
          color: 'white'
      })
    } else {
      
      const ExistsUserName = FullUserData.some((item) => item.username === UserName && item.id !== IdUser);
      const ExistsEmail = FullUserData.some((item) => item.email === Email && item.id !== IdUser);
      const SameEmail = FullUserData.some((item) => item.email === Email && item.id === IdUser);
      
      if (ExistsUserName) {
        Swal.fire({
          icon: 'error',
          text: 'El nombre de usuario no está disponible.',
          confirmButtonText: 'Cambiar',
          confirmButtonColor: '#3B82F6',
          background: '#233876aa',
          color: 'white'
        })
      } else if(ExistsEmail) {
          Swal.fire({
            icon: 'error',
            text: 'El correo eletrónico no está disponible.',
            confirmButtonText: 'Cambiar',
            confirmButtonColor: '#3B82F6',
            background: '#233876aa',
            color: 'white'
          })
        } else {

          
          if(SameEmail) {            
            EnterPassword(UpdateProfile)

          } else {
            Swal.fire({
              icon: 'info',
              text: '¿El correo electrónico es correcto?.',
              showCancelButton: true,
              cancelButtonText: 'No, cambiar',
              confirmButtonText: 'Si, verificar',
              reverseButtons: true,
              confirmButtonColor: '#3B82F6',
              background: '#233876aa',
              color: 'white'
            }).then((result) => {

              if(result.isConfirmed) {
                EnterPassword(RequestCode)                
              }
              
            })
        }
        
      }

    }
  };

  const RequestCode = async (password) => {

    const IsCorrect = await ValidatePassword(password)  
    
    if (!IsCorrect) {
      Swal.fire({
        icon: 'error',
        text: "La contraseña es incorrecta. Intentalo más tarde.",
        showConfirmButton: false,
        background: '#233876aa',
        color: 'white',
        timer: 3000
      })
    } else {
      setShowLoader(true)
  
      const response = await PostData('VcambioCorreo/', {
        name: Name,
        correo: Email,
      });
  
      setShowLoader(false);
  
      if (response.status === 200) {     
          localStorage.setItem("newEmail", Email);
          navigate('/verificarCambioCorreo');
          
      } else if (response.status === 429) {
          Swal.fire({
              icon: 'info',
              title: 'Demasiados intentos',
              text: response.data.error || 'Debes esperar antes de reenviar el código.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3B82F6',
              background: '#233876aa',
              color: 'white',
          });
      } else {
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.data.error || 'No se pudo enviar el correo.',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3B82F6',
              background: '#233876aa',
              color: 'white',
          });
      }
    }

  }
  
  const UpdateProfile = async (password) => {
    const IsCorrect = await ValidatePassword(password)  
    
    if (!IsCorrect) {
      Swal.fire({
        icon: 'error',
        text: "La contraseña es incorrecta. Intentalo más tarde.",
        showConfirmButton: false,
        background: '#233876aa',
        color: 'white',
        timer: 3000
      })
    } else {
      setShowLoader(true);
  
      let Theme = DarkMode ? "oscuro" : "normal";
      let ImageStatus = "same"; // valor por defecto
  
      if (UserImage === DefaultImage) {
        ImageStatus = "default";
  
      } else if (UserImage !== OriginalData.UserImage && UserImage !== DefaultImage) {
        ImageStatus = "new";
      }
  
      try {
        const responseUpdateUser = await PatchData("users/", IdUser, {
          first_name: Name,
          last_name: LastName,
          username: UserName,
        });
  
        const validResponse = responseUpdateUser.status === 200 || responseUpdateUser.status === 201;
  
        if (validResponse) {
          let referenciaIMG = null;
  
          if (ImageStatus === "default") {
            referenciaIMG = UserImage; // imagen por defecto
  
          } else if (ImageStatus === "new") {
            const uploadedUrl = await cloudDinaryServices.uploadImage(UserImage);
  
            if (!uploadedUrl) throw new Error("Error subiendo la imagen");
            referenciaIMG = uploadedUrl;
  
          } else {
            referenciaIMG = OriginalData.UserImage; // mantiene la misma
          }
                  
          const responseUpdateInfoUser = await PatchData("informacionUsuarios/", IdUser, {
            telefono: Phone,
            direccion: Address,
            referenciaIMG, 
            notificaciones: NotificationsOn,
            tema: Theme,
          });
  
          if (responseUpdateInfoUser.status === 200 || responseUpdateInfoUser.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Cambios guardados éxitosamente.",
              background: "#233876aa",
              color: "white",
              showConfirmButton: false,
              timer: 3000,
            });
           
            queryClient.invalidateQueries(["user"]);
  
            setIsEditing(false);
          }
        }
      } catch (error) {
        console.error("Error en la actualización:", error);
  
        Swal.fire({
          icon: "error",
          title: "Error al actualizar",
          text: error.message,
        });
      } finally {
        setShowLoader(false);
      }
    }

  };


  return (
    <div className="bg-[#0f172a] min-h-screen sm:p-10 lg:px-40 p-5 text-white">

    {ShowLoader && (
      <Loader/>
    )}

      {/* Header */}
      <div className="flex items-center mb-6 gap-3">
        <Link to="/principal" className="hover:scale-150">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-2xl font-bold">Perfil</h2>
      </div>

      {/* Card de perfil */}
      <div className="bg-[#1e293b] p-6 sm:p-10 rounded-xl shadow flex flex-col md:flex-row items-center md:items-start gap-6 relative">

        {/* Avatar */}
        <div className="relative md:w-[30%] lg:w-[25%] mt-10">
          <div className=" relative mx-auto w-[90%] md:w-[70%] lg:w-[80%]">     

            {isEditing && ( 
              <button 
                className="absolute right-0 hover:scale-130"
                onClick={() => { setUserImage(DefaultImage); fileInputRef.current.value = null; }}
                >
                <X size={24} />
              </button>
            )}      

            <img
              src={ImagePreview || UserImage}
              alt="Imagen de usuario"
              className="mx-auto w-32 h-32 rounded-full border-4 border-[#334155] object-cover cursor-pointer"
              onClick={() => isEditing && fileInputRef.current.click()}
              />
              
            {isEditing && ( 
              <p className="text-xs text-gray-400 mt-2 text-center">
                Haz clic en la foto para cambiarla
              </p>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 w-full">
          {!isEditing ? (
            <>
              <h3 className="text-xl font-semibold">{Name} {LastName} ({UserName})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><span className="font-medium">Email</span><p className="text-gray-400">{Email}</p></div>
                <div><span className="font-medium">Teléfono</span><p className="text-gray-400">{Phone || "No hay número registrado"}</p></div>
                <div><span className="font-medium">Rol</span><p className="text-gray-400">{Role}</p></div>
                <div>
                  <span className="font-medium">Se unió el</span>
                  <p className="text-gray-400"> 
                    {Joined ? new Date(Joined).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                  </p>
                </div>
              </div>
              <div><span className="font-medium block">Dirección</span><p className="text-gray-400">{Address || "No hay dirección registrada"}</p></div>

              <div className="mt-4 flex gap-3">
                <button onClick={DeleteAccount} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Eliminar cuenta</button>
                <button onClick={EditMode} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Editar Perfil</button>
              </div>
            </>
          ) : (
            <>
              {/* Formulario de edición */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Botones arriba a la derecha */}
                <div className="absolute top-4 right-4 flex gap-3">
                  <button
                    onClick={() => {setNotificationsOn(!NotificationsOn); setTooltip(!Tooltip)}}
                    className="relative p-2 bg-[#334155] rounded-full hover:bg-[#475569] transition"
                  >
                    {NotificationsOn ? <Bell size={20} /> : <BellOff size={20} />}
                  </button>

                  {Tooltip && (
                    <div class="absolute z-10 -top-15 inline-block px-3 py-1 text-sm font-medium text-white bg-gray-900 rounded-lg dark:bg-blue-900">

                        Notificaciones {TextTooltip}
                        <div class="tooltip-arrow" data-popper-arrow></div>

                        <div className="hidden">
                          {setTimeout(() => {
                            setTooltip(!Tooltip)
                          }, 1000)}
                        </div>
                    </div>
                  )}

                  <button
                    onClick={() => {setDarkMode(!DarkMode); setTooltip2(!Tooltip2)}}
                    className="p-2 bg-[#334155] rounded-full hover:bg-[#475569] transition"
                    >
                    {DarkMode ? <MoonIcon size={20} /> : <Sun size={20} />}
                  </button>

                  {Tooltip2 && (
                    <div class="absolute z-10 -top-15 left-12 inline-block px-3 py-1 text-sm font-medium text-white bg-gray-900 rounded-lg dark:bg-blue-900">

                        Tema {TextTooltip2}
                        <div class="tooltip-arrow" data-popper-arrow></div>

                        <div className="hidden">
                          {setTimeout(() => {
                            setTooltip2(!Tooltip2)
                          }, 1000)}
                        </div>
                    </div>
                  )}

                </div>
                
                <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col col-span-1">
                    <span className="font-medium">Nombre</span>
                    <input className="p-2 inline rounded bg-[#334155] text-white" value={Name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="flex flex-col col-span-1">
                    <span className="font-medium">Apellido</span>
                    <input className="p-2 inline rounded bg-[#334155] text-white" value={LastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div className="flex flex-col col-span-1">
                    <span className="font-medium">Usuario</span>
                    <input className="p-2 rounded bg-[#334155] text-white" value={UserName} onChange={(e) => setUserName(e.target.value)} />
                  </div>
                </div>

                <div className=" col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <span className="font-medium">Email</span>
                    <input className="p-2 rounded bg-[#334155] text-white" value={Email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-medium">Teléfono (opcional)</span>
                    <input className="p-2 rounded bg-[#334155] text-white" value={Phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                </div>
                
                <div className="w-[100%] col-span-2">
                  <span className="font-medium block">Dirección (opcional)</span>
                  <textarea rows={3} className="p-2 rounded w-[100%] bg-[#334155] text-white resize-none border-0 focus:border-1" value={Address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={CancelEdit} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg">Cancelar</button>
                <button onClick={EditSave} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">Guardar cambios</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
