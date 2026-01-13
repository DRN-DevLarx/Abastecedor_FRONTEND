import Default_Image from "../assets/Default_Image.jpg";
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ArrowLeft, Bell, BellOff, MoonIcon, Sun, LucideXCircle, LucideTrash, Trash, Edit, Save, ImageIcon, Upload, LucideSolarPanel } from "lucide-react";
import { Login } from "../services/Token/AuthServices";
import { GetData, PostData, PatchData, DeleteUserData, DeleteData } from "../services/ApiServices";
import cloudDinaryServices from '../services/cloudDinaryServices';
import { getCookie, GenerateToken } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import Loader from "./Loader"
import { useQueryClient } from "@tanstack/react-query";


import Alert, { showAlert } from "./Alert";
import Modal, { showModal } from "./Modal";
import { ThemeContext } from "styled-components";

function Profile() {

  const navigate = useNavigate()
  const queryClient = useQueryClient();
  const [Mode, setMode] = useState("normal");    
  
  const [ShowLoader, setShowLoader] = useState(false);  
  const [ShowUploadedImages, setShowUploadedImages] = useState(false);  
  
  const [FullUserData, setFullUserData] = useState([]);    
  const [OriginalData, setOriginalData] = useState({});

  const access_token = getCookie("access_token");
  const CurrentIdUser = jwtDecode(access_token).user_id  
  const CurrentUserName = jwtDecode(access_token).username  
  
  const [IdUser, setIdUser] = useState();  
  const [ViewUserAdmin, setViewUserAdmin] = useState(); 

  const [Role, setRole] = useState();
  const [Name, setName] = useState("");
  const [LastName, setLastName] = useState("");
  const [UserName, setUserName] = useState("");
  const [Email, setEmail] = useState("");
  const [Phone, setPhone] = useState("");
  const [Address, setAddress] = useState("");
  const [Joined, setJoined] = useState("");
  

  const [NewRole, setNewRole] = useState();
  const [NewName, setNewName] = useState("");
  const [NewLastName, setNewLastName] = useState("");
  const [NewUserName, setNewUserName] = useState("");
  const [NewEmail, setNewEmail] = useState("");
  const [NewPhone, setNewPhone] = useState("");
  const [NewAddress, setNewAddress] = useState("");
  const [NewDarkMode, setNewDarkMode] = useState();
  const [NewUserImage, setNewUserImage] = useState("");
  const [NewNotificationsOn, setNewNotificationsOn] = useState(false);


  const DefaultImage = Default_Image;
  

  const [UserImages, setUserImages] = useState([])
  
  const [UserImage, setUserImage] = useState();
  const [ImagePreview, setImagePreview] = useState()
  const fileInputRef = useRef(null);

  // Estados para los botones
  const [NotificationsOn, setNotificationsOn] = useState(false);
  const [Tooltip, setTooltip] = useState(false);
  const [Tooltip2, setTooltip2] = useState(false);
  
  const [Theme, setTheme] = useState("");
  const [DarkMode, setDarkMode] = useState(false);
  const [TextTooltip, setTextTooltip] = useState("");
  const [TextTooltip2, setTextTooltip2] = useState("");

  // Cooldown para reenviar
  const [cooldown, setCooldown] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  
  const [Code, setCode] = useState("")

  useEffect(() => {
    const Mode = localStorage.getItem("Mode");
    
    if (Mode) {
      setMode(Mode);
    }
  }, []);

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
    
    let IdUserCookie = ""

    const token = getCookie("UserCookie");

    if (!token) {
      // No hay token → redirigir
      navigate("/principal");
      return;
    }    

    try {
      const decoded = jwtDecode(token);
      
      setViewUserAdmin(decoded.ViewUserAdmin)
      setIdUser(decoded.id)

      IdUserCookie = decoded.id;

    } catch (error) {
      // Token inválido o modificado → redirigir
      console.warn("Token inválido:", error.message);
      navigate("/principal");
      document.cookie = "UserCookie=; path=/; max-age=0; secure; SameSite=Strict";

    }
    
    const fetchData = async () => {
      
      const UsersData = await GetData("users/");
      const UsersImagesData = await GetData("imagenesUsuarios/");

      const UserData = UsersData.find(FindUser => FindUser.id == IdUserCookie)
      const UserImagesData = UsersImagesData.filter(FindUser => FindUser.user == IdUserCookie)

      if (UserImagesData) {
        setUserImages(UserImagesData)
      }

      if (!UserData) navigate("/principal")
        
      setFullUserData(UsersData)
      setName(UserData.first_name);
      setLastName(UserData.last_name);
      setEmail(UserData.email);
      setUserName(UserData.username);
      setJoined(UserData.date_joined);

      if (UserData.groups.includes(1)) {
        setRole("admin")
        
      } else if (UserData.groups.includes(2)) {
        setRole("cliente")
        
      } else if (UserData.groups.includes(3)) {
        setRole("proveedor")
      }

      const AditionalInfo = await GetData("informacionUsuarios/");
      // filtrar usuario por id
      const UserInfo = AditionalInfo.find(UInfo => UInfo.user == IdUserCookie)
            
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
  }, [navigate]);
  
  useEffect(() => {

    // Manejo del cooldown
    if (cooldown > 0) {
        const id = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);
  
        setIntervalId(id);
  
        // limpiar intervalo cuando cooldown cambie o se desmonte
        return () => clearInterval(id);
    } else {
        clearInterval(intervalId);
        setIntervalId(null);
    }

    
  }, [cooldown])

  
  useEffect(() => {
    
    const NewChangesToken = getCookie("NewChanges");

    if (NewChangesToken) {

      try {
        const decoded = jwtDecode(NewChangesToken);
        
        const NewChanges = decoded;
  
        setNewRole(NewChanges.ROLE)
        setNewName(NewChanges.NAME)
        setNewLastName(NewChanges.LASTNAME)
        setNewUserName(NewChanges.USERNAME)
        setNewEmail(NewChanges.EMAIL)
        setNewPhone(NewChanges.PHONE)
        setNewAddress(NewChanges.ADDRESS)
        setNewDarkMode(NewChanges.DARKMODE)
        setNewUserImage(NewChanges.IMG)
        setNewNotificationsOn(NewChanges.NOTIFICATIONS)
  
      } catch (error) {
        // Token inválido o modificado → redirigir
        console.warn("Token NewChanges inválido:", error.message);
        localStorage.setItem("Mode", "edit")
        setMode("edit")
        document.cookie = "NewChanges=; path=/; max-age=0; secure; SameSite=Strict";
      }

    }

  }, []);
  

  // Escucha cambios de darkMode y aplica la clase
  const ThemeChange = (theme) => {    
    if (theme === "oscuro") {
      document.documentElement.classList.add("dark");

    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  const handleChange = (value) => {
      if (/^\d*$/.test(value)) {
          setCode(value);
      }
  };

  const handleClick = () => {

    if(UserImages.length >= 15) {
      showAlert("error", "LÍMITE ALCANZADO", "Solo puedes subir hasta 15 imágenes.");
      return;
    }

    fileInputRef.current.click(); // abre el input file si tiene menos de 15
  }

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validTypes.includes(file.type) || !validExtensions.includes(fileExtension)) {

        showAlert("error", "FORMATO NO PERMITIDO", "Solo se permiten archivos JPG, JPEG, PNG o WEBP.");
    
        e.target.value = ''; // Limpia el input
        return;
      }
      setImagePreview(URL.createObjectURL(file));
      UploadImage(file)
    }
  };

  const DeleteAccount = async () => {
    Swal.fire({
      icon: "warning",
      iconColor: "red",
      title: "¿Estás seguro que deseas eliminar la cuenta?",
      text: "Esta acción es irreversible.",
      showCancelButton: true,
      cancelButtonText: "No, cancelar",
      confirmButtonText: "Sí, eliminar",
      confirmButtonColor: "red",
      background: 'rgba(80, 80, 80, 0.75)',
      color: 'white',
    }).then((result) => {
      
      if (result.isConfirmed) {
        EnterPassword(DeleteContinue)
      }
    });
  };

  const DeleteContinue = async (password) => {

    const IsCorrect = await ValidatePassword(password) 
    
    
    if (IsCorrect === false) {

      showAlert("error", "CONTRASEÑA INCORRECTA", "La contraseña es incorrecta. Intentalo más tarde.");

    } else {    
      setShowLoader(true)
      const responseDeleteUser = await DeleteUserData("eliminarUsuario/", IdUser)
            
      setShowLoader(false)

      if(responseDeleteUser === 200) {

        showAlert("success", "ÉXITO", "La cuenta se ha eliminado con éxito");

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
    setMode("edit");
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

    setMode("normal");
  }

  const EditSave = async () => {

    let ValidPhone = false

    if (/^\d+$/.test(Phone) && Phone.length >= 8 || Phone.length === 0 ){
      ValidPhone = true
    } 

    if(UserImage === OriginalData.UserImage && NotificationsOn === OriginalData.NotificationsOn && DarkMode === OriginalData.DarkMode 
      && Name === OriginalData.Name && LastName === OriginalData.LastName && UserName === OriginalData.UserName 
      && Email == OriginalData.Email && Phone == OriginalData.Phone && Address == OriginalData.Address
     ) 
     {} else if(Name.length == 0 || LastName.length == 0 || UserName.length == 0 || Email.length == 0 ) {

      showAlert("info", "CAMPOS VÁCIOS", "Por favor completa los campos obligatorios.");

    } else if (ValidPhone === false) {
      showAlert("info", "NÚMERO NO VÁLIDO", "El número de telefono debe tener al menos 8 digitos si deseas agregarlo.");
      
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) {
      showAlert("info", "CORREO NO VÁLIDO", "El correo electrónico no es válido.");
    } else {
      
      const ExistsUserName = FullUserData.some((item) => item.username === UserName && item.id != IdUser);
      const ExistsEmail = FullUserData.some((item) => item.email === Email && item.id != IdUser);
      const SameEmail = FullUserData.some((item) => item.email === Email && item.id == IdUser);
      
      if (ExistsUserName) {
        showAlert("info", "USUARIO NO DISPONIBLE", "El nombre de usuario no está disponible.");

      } else if(ExistsEmail) {
        showAlert("info", "CORREO NO DISPONIBLE", "El nombre de correo electrónico no está disponible.");

      } else {

          
          if(SameEmail) {            
            EnterPassword(UpdateProfile,)
            

          } else {
            Swal.fire({
              icon: 'info',
              text: '¿El correo electrónico es correcto?.',
              showCancelButton: true,
              cancelButtonText: 'No, corregir',
              confirmButtonText: 'Si, continuar',
              confirmButtonColor: '#10B981',
              reverseButtons: true,
              background: 'rgba(80, 80, 80, 0.75)',
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

  const EnterPassword = async (NexFunction) => {
    
    let ButtonText = "Aceptar"
    let ButtonColor = "#10B981"
    
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
      background: 'rgba(80, 80, 80, 0.75)',
      color: 'white',
      html: `
        <div class ="h-16 w-full">
          <input 
            type="password" 
            id="swalPassword" 
            class ="relative mx-auto w-[60%] text-emerald-500 px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all placeholder-white/40" 
            placeholder="Contraseña"
          />
          <button 
            type="button" 
            id="togglePassword" 
            classN ="absolute top-[10px] text-gray-400 hover:text-white"
          >
            <svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className ="bi bi-eye-fill" viewBox="0 0 16 16">
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
            ? `<svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className ="bi bi-eye-slash-fill" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/></svg>`
            : `<svg id="eyeIcon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className ="bi bi-eye-fill" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/></svg>`;
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
        
        if (NexFunction == UpdateProfile) {
          NexFunction(password)

        } else {
          NexFunction(password)
        }

      }
    });
  }

  const ValidatePassword = async (password) => {
    
    setShowLoader(true);    

    
    
    const endpoint = "token/";
    const responseLogin = await Login(endpoint, {
        username: CurrentUserName,
        password: password,
      });
      
      
      setShowLoader(false);    
    
      
      if (responseLogin.status === 200) {    
        return true
        
      } else {
        return false
      }
  }

  
  
  const UpdateProfile = async (password) => {
          
    const IsCorrect = await ValidatePassword(password)    
    
    if (IsCorrect === false) {
      showAlert("error", "CONTRASEÑA INCORRECTA", "La contraseña es incorrecta. Intentalo más tarde.");

    } else {

      setShowLoader(true);
  
      let theme = DarkMode ? "oscuro" : "normal";
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
          email: Email,
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
            tema: theme,
          });
  
          if (responseUpdateInfoUser.status === 200 || responseUpdateInfoUser.status === 201) {
            ThemeChange(theme)
            showAlert("success", "Éxito", "Perfil editado con éxito.");
  
            queryClient.invalidateQueries(["user"]);
            setMode("normal");
          }
        }
      } catch (error) {
  
        showAlert("error", "Error", "Error al actualizar el perfil. Por favor verifica tu conexión a internet o comunicate con soporte.");
  
      } finally {
        setShowLoader(false);
      }
    }
  };
  
  
  const UpdateWithDifferentEmail = async () => {
        
    setShowLoader(true);

    let NewTheme = NewDarkMode ? "oscuro" : "normal";
    let ImageStatus = "same"; // valor por defecto

    if (NewUserImage === DefaultImage) {
      ImageStatus = "default";

    } else if (NewUserImage !== OriginalData.UserImage && NewUserImage !== DefaultImage) {
      ImageStatus = "new";
    }

    try {
      const responseUpdateUser = await PatchData("users/", IdUser, {
        first_name: NewName,
        last_name: NewLastName,
        username: NewUserName,
        email: NewEmail,
      });

      const validResponse = responseUpdateUser.status === 200 || responseUpdateUser.status === 201;

      if (validResponse) {
        let referenciaIMG = null;

        if (ImageStatus === "default") {
          referenciaIMG = NewUserImage; // imagen por defecto

        } else if (ImageStatus === "new") {
          const uploadedUrl = await cloudDinaryServices.uploadImage(NewUserImage);

          if (!uploadedUrl) throw new Error("Error subiendo la imagen");
          referenciaIMG = uploadedUrl;

        } else {
          referenciaIMG = OriginalData.UserImage; // mantiene la misma
        }
                
        const responseUpdateInfoUser = await PatchData("informacionUsuarios/", IdUser, {
          telefono: NewPhone,
          direccion: NewAddress,
          referenciaIMG, 
          notificaciones: NewNotificationsOn,
          tema: NewTheme,
        });

        if (responseUpdateInfoUser.status === 200 || responseUpdateInfoUser.status === 201) {

          showAlert("success", "Éxito", "Perfil editado con éxito.");

          queryClient.invalidateQueries(["user"]);
          setMode("normal");
          localStorage.removeItem("Mode")
          document.cookie = "access_token=; path=/; max-age=0; secure; SameSite=Strict";

        }
      }
    } catch (error) {

      showAlert("error", "Error", "Error al actualizar el perfil.");

    } finally {
      setShowLoader(false);
    }
    
  };



  const RequestCode = async (password) => {

    const IsCorrect = await ValidatePassword(password)
    
    
    if (IsCorrect === false) {
      showAlert("error", "CONTRASEÑA INCORRECTA", "La contraseña es incorrecta. Intentalo más tarde.");

    } else {
      setShowLoader(true)
  
      const response = await PostData('VcambioCorreo/', {
        name: Name,
        correo: Email,
      });
  
      setShowLoader(false);
  
      
      if (response.status === 200) {
        
        
        const TOKEN = await GenerateToken({NOTIFICATIONS: NotificationsOn, DARKMODE: DarkMode, IMG: UserImage, NAME: Name, LASTNAME: LastName, USERNAME: UserName, EMAIL: Email, PHONE: Phone, ROLE: Role, ADDRESS: Address}, "NewChanges");
        
        

        if(TOKEN) {
          setMode("verify")
          localStorage.setItem("Mode", "verify")
        }

      } else if (response.status === 429) {

          showAlert("info", "DEMASIADOS INTENTOS", "Debes esperar antes de reenviar el código.");
          
        } else {
            showAlert("error", "ERROR", response.data.error || "No se pudo enviar el correo.");
            
      }
    }

  }

  const ValidateCode = async () => {
    if (Code.length === 6) {
        setShowLoader(true);
        const endpoint = 'validarCodigo/';

        try {
            const response = await PostData(endpoint, {
                correo: NewEmail,
                codigo: Code,
            });

            setShowLoader(false);

            if (response.status === 200) {
                // Código correcto
               UpdateWithDifferentEmail()
                

            } else if (response.status === 400) {
                // Código incorrecto o expirado
                showAlert("error", "CÓDIGO NO VÁLIDO", "Verifica e intenta más tarde");

            } else if (response.status === 500) {
                // Error del servidor
                showAlert("error", "ERROR", "Error en el servidor. Intenta más tarde.");
                
              } else {
                //  response inesperada
                  showAlert("error", "response INESPERADDA", "Código: " + response.status);
                }

        } catch (error) {
            setShowLoader(false)
            //  Error de conexión
            showAlert("error", "ERROR DE CONEXIÓN", "No se pudo conectar con el servidor. Intenta más tarde.");
        }
    } else {
        // Código incompleto
        showAlert("error", "CÓDIGO IMCOMPLETO", "El código debe tener 6 dígitos.");
    }
  }

  const ResendCode = async () => {
    if (cooldown > 0) return; // no dejar reenviar si está en cooldown

    setShowLoader(true);
    const endpoint = "reenviarCodigo/";

    try {
        const response = await PostData(endpoint, {
            correo: NewEmail,
            nombre: NewName,
        });

        setShowLoader(false);

        if (response.status === 200) {

            showAlert("success", "ÉXITO", "Código reenviado con éxito");

            // Iniciar contador regresivo según wait_time
            setCooldown(response.data.wait_time);
        
        } 
        else if (response.status === 429) {
            // Cooldown impuesto por el backend
            setCooldown(response.data.wait_time);

            showAlert("info", "DEMASIADOS INTENTOS", "Debes esperar antes de reenviar el código.");
        } 
        else if (response.status === 400) {
          
            showAlert("error", "ERROR DE VALIDACIÓN", "El correo es inválido.");

        } else if (response.status === 500) {
  
            showAlert("error", "ERROR DEl SERVIDOR", "Intenta más tarde.");
            
          } else {

              showAlert("error", "response INESPERADA", "Código: " + response.status);
        }
    } catch (error) {
        setShowLoader(false);

        showAlert("error", "ERROR DE CONEXIÓN", "No se pudo conectar con el servidor. Intenta más tarde.");
    }
  }

  const UploadImage = async (file) => {

    try {
      setShowLoader(true);

      const uploadedUrl = await cloudDinaryServices.uploadImage(file);

      if (!uploadedUrl) {
        showAlert("error", "ERROR", "Ocurrió un error al subir la imagen.");

      } else {
        const responseUpdateInfoUser = await PatchData("informacionUsuarios/", IdUser, {
          referenciaIMG: uploadedUrl,
        });


        if (responseUpdateInfoUser) {
          const responseUploadNewImage = await PostData("imagenesUsuarios/", {
            imagen: uploadedUrl,
            user: IdUser,
          });

          setShowLoader(false);

          if (responseUploadNewImage) {
            setUserImages(prev => [...prev, uploadedUrl]);
            showAlert("success", "ÉXITO", "Imagen subida correctamente.");
            setUserImage(file);
            setShowUploadedImages(false)
            setMode("normal")

          }
        }
      }
    } catch (error) {
      setShowLoader(false);
      showAlert("error", "ERROR", "Ocurrió un error inesperado al subir la imagen.");
      console.error(error);
    }    
  }

  const SelectImage = async (Image) => {
    
    const responseUpdateInfoUser = await PatchData("informacionUsuarios/", IdUser, {
      referenciaIMG: Image,
    });

    if (responseUpdateInfoUser) {
      setUserImage(Image)
      showAlert("success", "ÉXITO", "Imagen actualizada con éxito.")
    }

    setMode("normal")
    setShowUploadedImages(false)
  }

  
  const DeleteUserImage = async () => {

    const responseUpdateInfoUser = await PatchData("informacionUsuarios/", IdUser, {
      referenciaIMG: DefaultImage,
    });

    if (responseUpdateInfoUser) {
      setUserImage(DefaultImage);
      // fileInputRef.current.value = null
      setMode("normal")

      showAlert("success", "ÉXITO", "Imagen eliminada con éxito.")
    }    
  }

  const DeleteImage = async (IdImage) => {

    const result = await Swal.fire({
      icon: 'warning',
      title: "¿Estás seguro que deseas eliminar la imagen?",
      text: "Esta acción es irreversible.",
      showCancelButton: true,
      cancelButtonText: 'No, cancelar',
      confirmButtonText: 'Sí, eliminar',
      confirmButtonColor: 'red',
      reverseButtons: true,
      background: 'rgba(80, 80, 80, 0.75)',
      color: 'white'
    });

    // Si no confirma, salimos
    if (!result.isConfirmed) return;

    // Solo entra aquí si el usuario confirmó
    setShowLoader(true);

    try {
      const response = await DeleteData("imagenesUsuarios/", IdImage);

      if (response) {
        setUserImages(prev => prev.filter(img => img.id !== IdImage));
        showAlert("success", "ÉXITO", "La imagen ha sido eliminada con éxito.");
      }

    } catch (err) {
      showAlert("error", "ERROR", "No se pudo eliminar la imagen.");
      console.error(err);
    } finally {
      setShowLoader(false);
    }
  };


  return (
    <div>
      {ShowLoader && (
        <Loader/>
      )}
      <div className="bg-[#adb6aac2] dark:bg-[#171731] dark:text-[#CEC19F] min-h-screen sm:p-10 p-5 text-black">  {/*lg:px-40*/}
      

      <Alert />
      <Modal /> 

        {/* Header */}
        <Link to={-1} className="flex items-center mb-6 gap-1 hover:scale-101 ">
            <ArrowLeft size={24} />
             <h2 className="text-2xl font-bold text-white mb-1"> Perfil de usuario</h2>
        </Link>

        {Mode != "verify" &&
          <div className="fixed inset-0 z-40 bg-[#83917f7c] dark:bg-[#171731] backdrop-blur-md overflow-hidden">
            <div className="h-full overflow-y-auto p-5">
              <div className="w-full sm:w-[90%] mx-auto">

                {/* Header */}
                <div className="relative mb-6">
                  <div className="rounded-[10px] p-6 shadow-2xl backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                          
                          {Mode === "normal" ? "Vista de Perfil" : "Modo Edición"}
                        </h1>
                        <p className="text-emerald-200">
                          {Mode === "normal" ? "Información y configuración de la cuenta" : "Edita la información y configuración de la cuenta"}
                        </p>
                      </div>
                      <button
                        onClick={() => {Mode === "normal" ? navigate(-1) : CancelEdit()}}
                        className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-2xl"
                      >
                        <X size={28} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">

                  {/* Columna izquierda */}
                  <div className="col-span-3 lg:col-span-2 space-y-4">

                    {/* Información personal */}
                    <div className="backdrop-blur-xl rounded-[10px] px-2 py-4 sm:p-6 sm:py-6 sm:shadow-2xl lg:h-100">

                      {Mode === "normal" ? (
                        <div className="grid sm:grid-cols-2 gap-4 text-white/80">

                          {/* Configuaración */}
                          <div className="col-span-2 w-full h-10 relative">

                            <div className="absolute right-0 flex gap-3 ">
                              <span className="p-2 bg-gray-400 opacity-60 dark:bg-[#334155] rounded-full hover:bg-[#475569] transition ">
                                {NotificationsOn ? <BellOff size={20} /> : <Bell size={20} />}
                              </span>

                              <span className="p-2 bg-gray-400 opacity-60 dark:bg-[#334155] rounded-full hover:bg-[#475569] transition">
                                {DarkMode ? <Sun size={20} /> : <MoonIcon size={20} />}
                              </span>

                            </div>

                          </div>
                          
                          <div className="col-span-2 lg:hidden flex flex-col items-center rounded-[10px] px-2 lg:py-15 h-35 lg:h-1000 text-center mb-2">
                            
                            {/* Avatar */}
                            <div className="relative mx-auto w-36">

                              <img
                                src={ImagePreview || UserImage || DefaultImage}
                                alt="Imagen de usuario"
                                className="mx-auto w-32 h-32 rounded-full border-4 border-emerald-400 object-contain cursor-pointer"
                                onClick={() => Mode === "edit" && setShowUploadedImages(true)}
                              />
                            </div>
                          </div>

                          <div><span className="text-emerald-200">Nombre</span><p>{Name} {LastName}</p></div>
                          <div><span className="text-emerald-200">Usuario</span><p>{UserName}</p></div>
                          <div><span className="text-emerald-200">Correo</span><p>{Email}</p></div>
                          <div><span className="text-emerald-200">Teléfono</span><p>{Phone || "No registrado"}</p></div>
                          <div><span className="text-emerald-200">Rol</span><p>{Role}</p></div>
                          <div>
                            <span className="text-emerald-200">Se unió el</span><p>{Joined? new Date(Joined).toLocaleDateString("es-ES", 
                              {
                                day: "2-digit",
                                month: "numeric",
                                year: "numeric",
                              })
                              : ""}

                            </p></div>

                          <div className="col-span-2" ><span className="text-emerald-200">Dirección</span><p>{Address || "No hay dirección registrada"}</p></div>
              
                          {/* Acciones */}
                          {(IdUser == CurrentIdUser || ViewUserAdmin) && (
                            <div className="col-span-2 lg:absolute bottom-8 mt-2 flex flex-col w-full sm:flex-row sm:justify-end gap-2 sm:gap-4 lg:hidden">
                              
                                <button
                                  onClick={DeleteAccount}
                                  className="flex gap-1 px-4 py-3 sm:px-4 sm:py-2 bg-red-500/80 hover:bg-red-600 text-white rounded-sm justify-center"
                                >
                                <Trash/> {ViewUserAdmin && IdUser !== CurrentIdUser ? "Eliminar usuario" : "Eliminar cuenta"}
                                </button>

                                <button
                                  onClick={EditMode}
                                  className="flex gap-1 px-4 py-3 sm:px-4 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm justify-center"
                                >
                                  <Edit/> Editar <span className="inline sm:hidden">perfil</span>
                                </button>
                              
                            </div>
                          )}    
                        </div>
                        
                      ) : (
                                            
                        <div className="grid sm:grid-cols-4 gap-4">

                          {/* Configuaración */}
                          <div className="col-span-4 w-full h-10 relative">
                            <div className="absolute right-0 flex gap-3 ">

                              <button
                                onClick={() => {setNotificationsOn(!NotificationsOn); setTooltip(!Tooltip)}}
                                className="relative p-2 bg-white opacity-60 dark:bg-[#334155] rounded-full hover:bg-[#475569] transition"
                              >
                                {NotificationsOn ? <BellOff size={20} /> : <Bell size={20} />}
                              </button>

                              {Tooltip && (
                                <div className ="absolute z-10 -top-15 inline-block px-3 py-1 text-sm font-medium text-white bg-gray-900 rounded-lg dark:bg-blue-900">

                                    Notificaciones {TextTooltip}
                                    <div className ="tooltip-arrow" data-popper-arrow></div>

                                    <div className="hidden">
                                      {setTimeout(() => {
                                        setTooltip(!Tooltip)
                                      }, 1000)}
                                    </div>
                                </div>
                              )}

                              <button
                                onClick={() => {setDarkMode(!DarkMode); setTooltip2(!Tooltip2)}}
                                className="p-2 bg-white opacity-60 dark:bg-[#334155] rounded-full hover:bg-[#475569] transition"
                                >
                                {DarkMode ? <Sun size={20} /> : <MoonIcon size={20} />}
                              </button>

                              {Tooltip2 && (
                                <div className ="absolute z-10 -top-15 w-25 left-12 inline-block px-3 py-1 text-sm font-medium text-white bg-gray-900 rounded-lg dark:bg-blue-900">

                                    Tema {TextTooltip2}
                                    <div className ="tooltip-arrow" data-popper-arrow></div>

                                    <div className="hidden">
                                      {setTimeout(() => {
                                        setTooltip2(!Tooltip2)
                                      }, 1000)}
                                    </div>
                                </div>
                              )}        
                            </div>
                          </div>

                          {/* Avatar */}
                          <div className="col-span-4 lg:hidden flex flex-col items-center rounded-[10px] lg:py-15 lg:h-1000 text-center">
                            <div className="relative mx-auto w-36">
                              {Mode === "edit" && UserImage !== DefaultImage && (
                                <button
                                  className="absolute right-0 -top-2 text-white/80 hover:text-red-400 transition"
                                  onClick={DeleteUserImage}
                                >
                                  <X size={22} />
                                </button>
                              )}

                              <img
                                src={ImagePreview || UserImage || DefaultImage}
                                alt="Imagen de usuario"
                                className="mx-auto w-32 h-32 rounded-full border-4 border-emerald-400 object-contain cursor-pointer"
                                onClick={() => Mode === "edit" && setShowUploadedImages(true)}
                              />

                              <p className="text-sm text-emerald-200 mt-3">
                                Haz clic en la foto para cambiarla
                              </p>
                            
                            </div>                
                          </div>

                          <div className="col-span-1">
                            <span className="text-emerald-200">Nombre</span>
                            <input 
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                            value={Name} onChange={e => setName(e.target.value)} placeholder="Nombre" />
                          </div>

                          <div className="col-span-1">
                            <span className="text-emerald-200">Apellido</span>
                            <input
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                            value={LastName} onChange={e => setLastName(e.target.value)} placeholder="Apellido" />
                          </div>

                          <div className="col-span-2">
                            <span className="text-emerald-200">Usuario</span>
                            <input
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                            value={UserName} onChange={e => setUserName(e.target.value)} placeholder="Usuario" />
                          </div>

                          <div className="col-span-2">
                            <span className="text-emerald-200">Correo</span>
                            <input
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                            value={Email} onChange={e => setEmail(e.target.value)} placeholder="Correo" />
                          </div>

                          <div className="col-span-2">
                            <span className="text-emerald-200">Teléfono</span>
                            <input
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                            value={Phone} onChange={e => setPhone(e.target.value)} placeholder="Teléfono" />
                          </div>

                          <div className="col-span-4">
                            <span className="text-emerald-200">Dirección</span>
                            <textarea
                              rows={3}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none text-white resize-none"
                              value={Address}
                              onChange={(e) => setAddress(e.target.value)}
                            />
                          </div>

                          {/* Acciones */}
                          {(IdUser == CurrentIdUser || ViewUserAdmin) && (
                            <div className="col-span-4 lg:absolute bottom-8 mt-2 flex flex-col w-full sm:flex-row sm:justify-end gap-2 sm:gap-4 lg:hidden">
                              
                                  <button
                                    onClick={CancelEdit}
                                    className="flex gap-1 px-4 py-3 sm:px-4 sm:py-2  bg-white/10 hover:bg-white/20 text-white rounded-sm justify-center"
                                  >
                                    <X/>
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={EditSave}
                                    className="flex gap-1 px-4 py-3 sm:px-4 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm justify-center"
                                  >
                                    <Save/>
                                    Guardar
                                  </button>
                              
                            </div>
                          )}

                        </div>
                      )}
                    </div>

                  </div>


                  {/* Columna derecha */}              
                  <div className="col-span-3 lg:col-span-1 hidden lg:flex flex-col items-center backdrop-blur-xl rounded-[10px] px-2 py-7 lg:py-15 lg:h-100 shadow-2xl text-center">
                  
                    {/* Avatar */}
                    <div className="relative w-36 mx-auto">
                      {Mode === "edit" && UserImage !== DefaultImage && (
                        <button
                          className="absolute right-0 -top-2 text-white/80 hover:text-red-400 transition"
                          onClick={DeleteUserImage}
                        >
                          <X size={22} />
                        </button>
                      )}

                      <img
                        src={ImagePreview || UserImage || DefaultImage}
                        alt="Imagen de usuario"
                        className="mx-auto w-32 h-32 rounded-full border-4 border-emerald-400 object-contain cursor-pointer"
                        onClick={() => Mode === "edit" && setShowUploadedImages(true)}
                      />

                      {Mode === "edit" && (
                        <p className="text-sm text-emerald-200 mt-3">
                          Haz clic en la foto para cambiarla
                        </p>
                      )}
                    </div>

                    {/* Acciones */}
                    {(IdUser == CurrentIdUser || ViewUserAdmin) && (
                      <div className="absolute w-[80%] bottom-4 py-6 flex flex-col gap-2">
                        
                        {Mode === "normal" ? (
                          <>
                            <button
                              onClick={DeleteAccount}
                              className=" flex gap-1 px-4 py-2 bg-red-500/80 hover:bg-red-600 text-white justify-center rounded-sm transition"
                            >
                              <Trash/> {ViewUserAdmin && IdUser !== CurrentIdUser ? "Eliminar usuario" : "Eliminar cuenta"}
                            </button>

                            <button
                              onClick={EditMode}
                              className="flex gap-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white justify-center rounded-sm transition"
                            >
                              <Edit/>
                              Editar perfil
                            </button>

                          </>
                          
                        ) : (
                          <>
                            <button
                              onClick={CancelEdit}
                              className="flex gap-1 px-4 py-3 sm:px-4 sm:py-2  bg-white/10 hover:bg-white/20 text-white rounded-sm justify-center"
                            >
                              <X/>
                              Cancelar
                            </button>
                            <button
                              onClick={EditSave}
                              className="flex gap-1 px-4 py-3 sm:px-4 sm:py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm justify-center"
                            >
                              <Save/>
                              Guardar cambios
                            </button>
                          </>
                        )}
                      </div>
                    )}

                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        }

        {Mode === "verify" && 
          <div className="flex items-center w-full">
              <form className="bg-[#adb6aa] dark:bg-gray-800 py-8 w-[100%] min-[620px]:w-[80%] 
              min-[768px]:w-[70%] min-[890px]:w-[60%] lg:w-[50%] xl:w-[40%] flex flex-col gap-5 
              mx-auto border border-gray-700 rounded-2xl ">

                  <h1 className='text-[30px] text-center font-bold dark:text-white mx-auto w-[70%] min-[890px]:w-[55%] lg:w-[60%] xl:w-[60%]'> 
                  Verificar nuevo correo electrónico 
                  </h1>
                  <div>
                      <p id="helper-text-explanation" className="w-[70%] mx-auto text-center mb-3 text-sm text-gray-500 dark:text-gray-400">
                          Por favor, introduzca el código de 6 dígitos que le enviamos a {NewEmail} {NewUserName}
                      </p>

                      <div className="w-[100%] flex justify-center mb-2 space-x-2 rtl:space-x-reverse">
                          <div>
                              <label htmlFor="code-1" className="sr-only">code</label>
                              <input 
                              value={Code} 
                              className="bg-gray-300 dark:bg-[#334155] placeholder:text-3xl block w-50 h-10 py-3  
                              font-bold tracking-widest text-center text-gray-900border border-gray-300 rounded-lg focus:ring-primary-500 
                              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white 
                              dark:focus:ring-[#38664e]" placeholder='------'
                              
                              onChange={e => handleChange(e.target.value)} 
                              type="text" autoComplete='off' inputMode='numeric' 
                              pattern="[0-9]*" maxlength="6" data-focus-input-init 
                              data-focus-input-next="code-2" id="code-1"/>
                              
                              <div className='text-center'>

                                  <button 
                                  type='button' 
                                  onClick={ResendCode} 
                                  disabled={cooldown > 0}
                                  className={`inline cursor-pointer mx-auto my-3 text-[14px] ${ cooldown > 0 ? "text-gray-500 cursor-not-allowed" : "text-blue-600 hover:underline" }`}>
                                      {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar código" }
                                  </button>

                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex justify-around w-[100%] mx-auto">

                      <button
                      onClick={() => {setMode("edit"), localStorage.removeItem("Mode")}}
                      className="text-black dark:text-white flex items-center border focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 hover:bg-[#ccbfa487]">
                          Cancelar
                      </button>

                      <button 
                      onClick={() => ValidateCode()} 
                      type="button" 
                      className="bg-[#38664e] hover:bg-[#30b06e] text-white dark:text-black flex items-center focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-gray-600 dark:focus:ring-blue-800">
                          Siguiente
                          <svg className="rtl:rotate-0 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                          </svg>
                      </button>
                  </div>
                  
              </form>
          </div>
        }

        {ShowUploadedImages && (
          <div className="fixed inset-0 z-[40] backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-400/40 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl">
                    <ImageIcon className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">Gestionar Galería</h3>
                    <p className="text-sm text-emerald-200">Máximo 5 imágenes</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadedImages(false)}
                  className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-2 rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] scrollbar-custom">

                {/* Subir imagen */}
                <div className="mb-6">
                  <div
                    onClick={handleClick}
                    className="bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-6 text-center hover:border-emerald-400/50 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-3">
                      <Upload className="h-8 w-8 text-emerald-300" />
                    </div>

                    <p className="text-white font-medium mb-1">
                      {UserImages.length >= 10
                        ? "Límite alcanzado (10/10)"
                        : "Subir imagen"}
                    </p>

                    <p className="text-emerald-200 text-sm">
                      {UserImages.length >= 10
                        ? "Elimina alguna para agregar más"
                        : `PNG, JPG, JPEG • ${UserImages.length}/10 subidas.`}
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={UserImages.length >= 10}
                    />
                  </div>
                </div>

                {/* Grid de imágenes */}
                {UserImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {UserImages.slice().reverse().map((IMGS, index) => (
                      <div key={index} className="relative">
                        <div className="relative overflow-hidden rounded-xl ring-2 ring-white/20 hover:ring-white/40 transition-all">
                          
                          <img
                            src={IMGS.imagen}
                            onClick={() => SelectImage(IMGS.imagen)}
                            className="w-full h-40 object-contain cursor-pointer"
                            alt=""
                          />

                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

                          {/* Eliminar */}
                          <button
                            type="button"
                            onClick={() => DeleteImage(IMGS.id)}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                          >
                            <X size={16} />
                          </button>

                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-4">
                      <ImageIcon className="w-10 h-10 text-white/30" />
                    </div>
                    <p className="text-white/60">No hay imágenes todavía</p>
                    <p className="text-white/40 text-sm mt-1">Sube tu primera imagen arriba</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default Profile;
