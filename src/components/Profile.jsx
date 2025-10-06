import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X, ArrowLeft, Bell, BellOff, MoonIcon, Sun, LucideXCircle, LucideTrash } from "lucide-react";
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


  const DefaultImage = "https://res.cloudinary.com/dateuzds4/image/upload/v1758219782/jpxfnohhrbfkox7sypjl.jpg";
  

  const [UserImages, setUserImages] = useState([])
  
  const [UserImage, setUserImage] = useState();
  const [ImagePreview, setImagePreview] = useState()
  const fileInputRef = useRef(null);

  // Estados para los botones
  const [NotificationsOn, setNotificationsOn] = useState(false);
  const [Tooltip, setTooltip] = useState(false);
  const [Tooltip2, setTooltip2] = useState(false);
  
  const [DarkMode, setDarkMode] = useState();
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
      setTextTooltip2("oscuro activado")
    } else {      
      setTextTooltip2("normal activado")
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
  
        console.log(NewChanges);
  
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
  useEffect(() => {
    if (DarkMode) {
      document.documentElement.classList.add("dark");

    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [DarkMode]);

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

  const DeleteContinue = async (password) => {

    const IsCorrect = await ValidatePassword(password) 
    console.log("Es correcta? ", IsCorrect);
    
    
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
            console.log("Aqui va");
            

          } else {
            Swal.fire({
              icon: 'info',
              text: '¿El correo electrónico es correcto?.',
              showCancelButton: true,
              cancelButtonText: 'verificar',
              confirmButtonText: 'Si, continuar',
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
        <div className ="h-16 w-full relative">
          <input 
            type="password" 
            id="swalPassword" 
            className ="p-2 w-[60%] bg-transparent rounded-[5px] border border-gray-500 text-white" 
            placeholder="Contraseña"
          />
          <button 
            type="button" 
            id="togglePassword" 
            className ="absolute top-[10px] right-[23%] text-gray-400 hover:text-white"
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

    console.log(CurrentUserName);
    console.log(password);
    
    
    const endpoint = "token/";
    const responseLogin = await Login(endpoint, {
        username: CurrentUserName,
        password: password,
      });
      
      console.log(responseLogin);
      
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
            tema: Theme,
          });
  
          if (responseUpdateInfoUser.status === 200 || responseUpdateInfoUser.status === 201) {
  
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
    
    console.log("Aqui vamoooossss");
    
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
    console.log("Es correcta?: ", IsCorrect);
    
    
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
        
        console.log(typeof UserImage);
        console.log(UserImage);
        
        const TOKEN = await GenerateToken({NOTIFICATIONS: NotificationsOn, DARKMODE: DarkMode, IMG: UserImage, NAME: Name, LASTNAME: LastName, USERNAME: UserName, EMAIL: Email, PHONE: Phone, ROLE: Role, ADDRESS: Address}, "NewChanges");
        
        console.log(jwtDecode(TOKEN));
        

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

        console.log(responseUpdateInfoUser);

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

    showModal(
      "ELIMINAR IMAGEN",
      "Vas a eliminar una imagen. Esta acción es irreversible.",
      "¿Deseas continuar?",
      "CONFIRMAR",
      async () => {
        setShowLoader(true)
        try {
          const response = await DeleteData("imagenesUsuarios/", IdImage);
          console.log(response)
          setShowLoader(false)

          if (response) {
            setUserImages((prev) => prev.filter(img => img.id !== IdImage));
            showAlert("success", "ÉXITO", "La imagen ha sido eliminada con éxito.");

          }
        } catch (err) {
          setShowLoader(false)
          showAlert("error", "ERROR", "No se pudo eliminar la imagen.");
          console.error(err);
        }
      },
      "bg-[#f8040479]"
    )
  }

  return (
    <div>
      {ShowLoader && (
        <Loader/>
      )}
      <div className="bg-[#adb6aaa8] dark:bg-[#171731] dark:text-[#CEC19F] min-h-screen sm:p-10 p-5 text-black">  {/*lg:px-40*/}
      

      <Alert />
      <Modal /> 

        {/* Header */}
        <div className="flex items-center mb-6 gap-3">
          <Link to={-1} className="hover:scale-150">
            <ArrowLeft size={24} />
          </Link>
          <h2 className="text-2xl font-bold">Perfil</h2>
        </div>

        {Mode != "verify" &&
        <div className="bg-[#adb6aa] dark:bg-gray-800 dark:text-[#CEC19F] lg:mx-20 p-6 sm:p-10 rounded-xl shadow flex flex-col md:flex-row items-center md:items-start gap-6 relative">

          {/* Avatar */}
          <div className="relative w-[100%] md:w-[30%] mt-10">
            <div className="relative mx-auto w-[150px]">     

              {Mode === "edit" && UserImage !== DefaultImage &&
                <button 
                  className="absolute right-0 hover:scale-130"
                  onClick={() => DeleteUserImage()}
                  >
                  <X size={24} />
                </button>
              } 

              <img
                src={ImagePreview || UserImage}
                alt="Imagen de usuario"
                className="mx-auto w-32 h-32 rounded-full border-4 border-[#334155] object-cover cursor-pointer"
                onClick={() => Mode === "edit" && setShowUploadedImages(true)}
                />
                
              {Mode === "edit" && 
                <p className="text-xs dark:text-gray-400  mt-2 text-center">
                  Haz clic en la foto para cambiarla
                </p>
              }
            </div>

          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 w-full">
            {Mode == "normal" &&
              <>
                <h3 className="text-xl font-semibold">{Name} {LastName} ({UserName})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><span className="font-medium">Correo</span><p className="text-black opacity-70 dark:text-white dark:opacity-50">{Email}</p></div>
                  <div><span className="font-medium">Teléfono</span><p className="text-black opacity-70 dark:text-white dark:opacity-50">{Phone || "No hay número registrado"}</p></div>
                  <div><span className="font-medium">Rol</span><p className="text-black opacity-70 dark:text-white dark:opacity-50">{Role}</p></div>
                  <div>
                    <span className="font-medium">Se unió el</span>
                    <p className="text-black opacity-70 dark:text-white dark:opacity-50"> 
                      {Joined ? new Date(Joined).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : ""}
                    </p>
                  </div>
                </div>
                <div><span className="font-medium block">Dirección</span><p className="text-black opacity-70 dark:text-white dark:opacity-50">{Address || "No hay dirección registrada"}</p></div>

              { (IdUser == CurrentIdUser || ViewUserAdmin) &&
                <>
                  <div className="mt-4 flex gap-3">
                    <button onClick={DeleteAccount} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Eliminar cuenta</button>
                    <button onClick={EditMode} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Editar Perfil</button>
                  </div>
                </>
              } 
              </>
              }
              {Mode === "edit" &&
              <>
                {/* Formulario de edición */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Botones arriba a la derecha */}
                  <div className="absolute top-4 right-4 flex gap-3">
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
                  
                  <div className="col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col col-span-1">
                      <span className="font-medium dark:text-white">Nombre</span>
                      <input className="p-2 inline rounded bg-gray-300 dark:bg-[#334155] focus:outline-[#38664e]" value={Name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="flex flex-col col-span-1">
                      <span className="font-medium dark:text-white">Apellido</span>
                      <input className="p-2 inline rounded bg-gray-300 dark:bg-[#334155] focus:outline-[#38664e]" value={LastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className="flex flex-col col-span-1">
                      <span className="font-medium dark:text-white">Usuario</span>
                      <input className="p-2 rounded bg-gray-300 dark:bg-[#334155] focus:outline-[#38664e]" value={UserName} onChange={(e) => setUserName(e.target.value)} />
                    </div>
                  </div>

                  <div className=" col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium dark:text-white">Correo</span>
                      <input className="p-2 rounded bg-gray-300 dark:bg-[#334155] focus:outline-[#38664e]" value={Email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-medium dark:text-white">Teléfono (opcional)</span>
                      <input className="p-2 rounded bg-gray-300 dark:bg-[#334155] focus:outline-[#38664e]" value={Phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="w-[100%] col-span-2">
                    <span className="font-medium dark:text-white block">Dirección (opcional)</span>
                    <textarea rows={3} 
                      className="bg-gray-300 dark:bg-[#334155] focus:outline-none border-0 p-2 rounded w-[100%] resize-none" 
                      value={Address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={CancelEdit} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Cancelar</button>
                  <button onClick={EditSave} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Guardar cambios</button>
                </div>
              </>
            }


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
          <div className="bg-gray-900 w-full h-[100vh] absolute left-0 top-0 z-40 flex items-center justify-center p-0 text-black">
              
            <div className="bg-[#adb6aa] dark:bg-[#7c807a] dark:text-[#CEC19F] fixed w-[92%] rounded-xl shadow
            min-[620px]:w-[85%]
            md:w-[80%]
            lg:w-[70%]
            xl:w-[65%]
            ">
              
              <div 
              className='p-2 text-[20px] flex items-center justify-between border-b-1 text-black font-semibold
              min-[620px]:pl-3
              md:grid-cols-4 md:pl-5
              lg:pl-10
              xl:pl-10
              
              '>
                  <h1> Imagenes subidas </h1>
                  <LucideXCircle className="hover:scale-120" onClick={() => setShowUploadedImages(false)}/>
              </div>

              <div className='scrollbar-custom overflow-y-auto grid grid-cols-3 max-h-[70vh] gap-1 px-2 py-5
              min-[620px]:px-3
              md:grid-cols-4 md:px-5
              lg:px-10
              xl:px-10
              '>
                  
  
              <div
                onClick={handleClick}
                className="flex flex-col items-center justify-center h-[120px] md:h-[150px] border border-white border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
              >
                {/* Ícono */}
                <svg className="w-8 h-8 mb-1 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>

                {/* Texto */}
                <p className="text-center w-[95%] mx-auto font-semibold text-sm text-gray-500 dark:text-gray-400">Click para subir una imagen</p>

                {/* Input oculto */}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>


                {UserImages.slice().reverse().map((IMGS, index) => (
                
                  <div className ="relative h-[120px] md:h-[150px]" key={index}>
                    <img onClick={() => SelectImage(IMGS.imagen)} className="-z-10 opacity-80 hover:opacity-100 rounded-lg h-full w-full border-gray-700 border-[0.5px]" src={IMGS.imagen} alt="" />
                  
                    <LucideTrash className="w-6 absolute right-2 top-2 hover:scale-120" onClick={() => DeleteImage(IMGS.id)} />
                  </div>
                ))}  

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


export default Profile;
