import Default_Image from "../assets/Default_Image.jpg";
import { useState, useEffect } from "react";
import { GetData, PostData, DeleteData } from "../services/ApiServices";
import { getCookie, GenerateToken } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import { AutenticatedUserData } from "../services/Token/AuthServices";
import { LucidePlusSquare, Search, EyeIcon, Trash2, X, Plus, User, Mail, Phone, IdCard, Upload, Image as ImageIcon, ShieldCheck, PhoneCall, PhoneIcon, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Alert, { showAlert } from "./Alert";
import Loader from "./Loader"
import cloudDinaryServices from '../services/cloudDinaryServices';

function UsersList() {

    const navigate = useNavigate()
    const [ShowLoader, setShowLoader] = useState(false);

    const [UsersData, setUsersData] = useState([]);
    const NumberUsers = UsersData.length;
    const [UsersInfoA, setUsersInfoA] = useState([]);
    const [rolesData, setRolesData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");

    const DefaultImage = Default_Image;
    const [CurrentIdUser, setCurrentIdUser] = useState();
    const [CurrentUserImage, setCurrentUserImage] = useState();
    const [CurrentUserPhone, setCurrentUserPhone] = useState();
    const [CurrentFirstName, setCurrentFirstName] = useState("");
    const [CurrentLastName, setCurrentLastName] = useState("");
    const [CurrentEmail, setCurrentEmail] = useState("");
    const [CurrentDateJoined, setCurrentDateJoined] = useState("");

    const access_token = getCookie("access_token");
    const Role = jwtDecode(access_token).role;
    
    const userQuery = AutenticatedUserData();

    const [AddUserActive, setAddUserActive] = useState(false);
    const [mostrarGaleria, setMostrarGaleria] = useState(false);
    const [imagenUsuario, setImagenUsuario] = useState(null);

    // const [formData, setFormData] = useState({
    //     username: '',
    //     first_name: '',
    //     last_name: '',
    //     email: '',
    //     password: '',
    //     telefono: '',
    //     direccion: '',
    //     groups: []
    // });

    // const rolesData = [
    // { "id": 1, "name": "admin" },
    // { "id": 2, "name": "clienet" },
    // { "id": 3, "name": "proveedor" }
    // ]


    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password2: "",
        is_active: true,
        group: "",          //rol
        telefono: "",
        direccion: ""
    });


    useEffect(() => {
    
        if (userQuery.status === "success" && userQuery.data) {
            setCurrentIdUser(userQuery.data.id) 
            setCurrentFirstName(userQuery.data.first_name);
            setCurrentLastName(userQuery.data.last_name);
            setCurrentEmail(userQuery.data.email);
            setCurrentDateJoined(userQuery.data.date_joined);
        }
    
        const fetchData = async () => {
            
            const GetUsersData = await GetData("users/");
            const GetUserInfo = await GetData("informacionUsuarios/");
            const GetGroupsInfo = await GetData("grupos/");

            if(GetUsersData && GetUserInfo && GetGroupsInfo) {
                setUsersData(GetUsersData)
                setUsersInfoA(GetUserInfo)
                setRolesData(GetGroupsInfo)
            }
            
            // filtrar usuario por id
            const CurrentUserID = userQuery.data?.id;
            const CurrenteUserInfo = GetUserInfo?.find(CUInfo => CUInfo.user === CurrentUserID)
        
            if (CurrenteUserInfo) {
                setCurrentUserImage(CurrenteUserInfo.referenciaIMG);
                setCurrentUserPhone(CurrenteUserInfo.telefono);
                
                if(!CurrenteUserInfo.referenciaIMG) {
                    setCurrentUserImage(DefaultImage);
                }
            }  
        }
        fetchData();
    }, [userQuery.status, userQuery.data]);
    
    async function ViewProfile(Id) {
        const TOKEN = await GenerateToken({ id: Id, ViewUserAdmin: true }, "UserCookie");

        if(TOKEN) {
            navigate("/perfil")
        }
    }

    const UserDelete = async (id) => {

        const Delete = await Swal.fire({
            icon: "warning",
            iconColor: "red",
            title: "¿Estás seguro que deseas eliminar el usuario?",
            text: "Esta acción es irreversible.",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            confirmButtonText: "Sí, eliminar",
            confirmButtonColor: "red",
            background: 'rgba(80, 80, 80, 0.75)',
            color: "white",
        }).then((result) => {
            
            if (result.isConfirmed) {
                return true;
            }
        });
        
        if (Delete === true) {
            const responseDelete = await DeleteData("users/", id)
            
            if (responseDelete.status === 204 || responseDelete.status === 201 || responseDelete.status === 200) {
                setUsersData(prev =>
                    prev.filter(user => user.id !== id)
                );
                
                showAlert("success", "ÉXITO", "Usuario eliminado correctamente.");
            } else {
                showAlert("error", "ERROR", "No se pudo eliminar el usuario.");
            }
        }
    }
    
    function FilterUser(UsersData, UsersInfoA, searchValue, CurrentIdUser) {
   
        if (!searchValue || searchValue.trim() === "") {
            const users = UsersData.filter(user => user.id !== CurrentIdUser);
            const infos = UsersInfoA.filter(info => info.user !== CurrentIdUser);
            return { users, infos };
        }

        const inputLowerCase = searchValue.toLowerCase();

        const filteredUsers = UsersData.filter(user => {
            if (user.id === CurrentIdUser) return false;

            const info = UsersInfoA.find(info => info.user === user.id);
            const groupNames = user.groups?.map(id => rolesData[id]?.toLowerCase()) || [];

            return (
                user.username?.toLowerCase().includes(inputLowerCase) ||
                user.first_name?.toLowerCase().includes(inputLowerCase) ||
                user.last_name?.toString().toLowerCase().includes(inputLowerCase) ||
                user.email?.toLowerCase().includes(inputLowerCase) ||
                groupNames.some(name => name?.includes(inputLowerCase)) ||
                info?.telefono?.toLowerCase().includes(inputLowerCase)
            );
        });

        const filteredInfos = UsersInfoA.filter(info =>
            filteredUsers.some(user => user.id === info.user)
        );

        return { users: filteredUsers, infos: filteredInfos };
    }

    const handleClose = () => {
        setAddUserActive(false);
        setImagenUsuario(null);
        setFormData({
            username: '',
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            telefono: '',
            direccion: '',
            groups: []
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        
        if (file) {
            setImagenUsuario({
                id: Date.now(),
                url: URL.createObjectURL(file),
                file: file
            });
        }
    };

    const removeImage = () => {
        setImagenUsuario(null);
    };

    const ValidateFields = () => {
        if (!formData.username || !formData.first_name || !formData.last_name || !formData.email || !formData.password || !formData.password2) {
            showAlert("info", "Campos incompletos", "Por favor complete todos los campos obligatorios.");
            return false;
        }

        if (formData.username.length < 3) {
            showAlert("info", "Usuario inválido", "El identificador del usuario debe tener al menos 3 caracteres.");
            return false;
        }

        if (formData.first_name.length < 3) {
            showAlert("info", "Nombre inválido", "El nombre debe tener al menos 3 caracteres.");
            return false;
        }

        if (formData.last_name.length < 3) {
            showAlert("info", "Apellido inválido", "El apellido del usuario debe tener al menos 3 caracteres.");
            return false;
        }

        if (formData.password.length < 6) {
            showAlert("info", "Contraseña inválida", "La contraseña debe tener al menos 6 caracteres.");
            return false;
        }

        if (formData.password !== formData.password2) {
            showAlert("info", "Sin coincidencias", "Las contraseñas no coinciden.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert("info", "Email inválido", "Por favor ingresa un email válido.");
            return false;
        }

        if (formData.group.length === 0) {
            showAlert("info", "Rol no seleccionado", "Por favor selecciona al menos un rol.");
            return false;
        }

        return true;
    };

    const handleCreateUser = async () => {
        if (!ValidateFields()) return;

        try {
            let imageUrl = DefaultImage;

            if (imagenUsuario) {
                Swal.fire({
                    title: "Subiendo imagen",
                    html: "<b>Procesando imagen de perfil...</b>",
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    background: 'rgba(80, 80, 80, 0.75)',
                    color: "white",
                    didOpen: () => Swal.showLoading()
                });

                imageUrl = await cloudDinaryServices.uploadImage(imagenUsuario.file);
                console.log(imageUrl);
                
            }

            Swal.update({
                title: "Creando usuario",
                html: "<b>Guardando información del usuario...</b>"
            });

            // Swal.showLoading();
            setShowLoader(true)

            const userPayload = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
            };

            const userResponse = await PostData("users/", userPayload);
            const userId = userResponse.data.id;

            if (!userId) throw new Error("Usuario no creado");

            const userInfoPayload = {
                user: userId,
                telefono: formData.telefono || "",
                direccion: formData.direccion || "",
                referenciaIMG: imageUrl
            };

            await PostData("informacionUsuarios/", userInfoPayload);

            console.log(userResponse);
            
            const responseUserGroup = await PostData("asignarGrupo/", {
                user_id: userResponse.data.id,
                group_id: formData.group
            });

            console.log(responseUserGroup)

            // Swal.close();
            setShowLoader(false)

            showAlert("success", "¡Éxito!", "Usuario agregado correctamente");

            setAddUserActive(false);
            setImagenUsuario(null);
            setFormData({
                username: '',
                first_name: '',
                last_name: '',
                email: '',
                password: '',
                telefono: '',
                direccion: '',
                groups: []
            });

            // Actualizar la lista de usuarios
            const GetUsersData = await GetData("users/");
            const GetUserInfo = await GetData("informacionUsuarios/");
            setUsersData(GetUsersData);
            setUsersInfoA(GetUserInfo);

        } catch (error) {
            console.error(error);
            // Swal.close();
            setShowLoader(false)
            showAlert("error", "Error", "Ocurrió un error al agregar el usuario");
        }
    };

    let { users, infos } = FilterUser(UsersData, UsersInfoA, SearchValue, CurrentIdUser);
    
    return (
    <div className="w-[100%] pb-10 min-h-[100vh] bg-[#adb6aac2] dark:bg-[#171731] dark:text-[#CEC19F]">
        {ShowLoader && (
            <Loader/>
        )}
        <Alert />
        
        <div className="relative w-[95%] overflow-hidden md:w-[90%] mx-auto sm:rounded-l">
        <div className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">

            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-black dark:text-white">Usuarios</h2>
                <span className="flex justify-center items-center h-6 w-6 text-sm rounded-full bg-emerald-400 text-black">
                {NumberUsers}
                </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full lg:w-[65%] p-1">
                <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 sm:top-[45%] -translate-y-1/2" />
                <input
                    value={SearchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    placeholder="Buscar usuario"
                    className="w-full ps-10 py-2 text-sm text-white placeholder-gray-100
                            border border-gray-300 rounded-lg
                            bg-emerald-400/20
                            focus:outline focus:outline-emerald-500
                            dark:border-gray-600 dark:placeholder-gray-400"
                />
                </div>

                <button
                onClick={() => setAddUserActive(true)}
                className="flex items-center justify-center gap-1 px-2 py-2 sm:py-0 text-sm
                            rounded-lg text-gray-400 bg-emerald-400/20
                            border border-gray-300
                            hover:bg-emerald-500 hover:text-white hover:scale-105 transition"
                >
                <LucidePlusSquare />Agregar usuario
                </button>
            </div>
            </div>

            <div className="mt-1 h-px bg-gray-300 dark:bg-gray-700" />
        </div>

        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-100 uppercase bg-emerald-600 backdrop-blur-md">
            <tr>
                <th className="px-2 py-3">Usuario</th>
                <th className="px-2 py-3">Rol</th>
                <th className="px-2 py-3">Telefono</th>
                <th className="px-2 py-3 hidden md:table-cell">Fecha de registro</th>
                <th className="px-2 py-3 text-center">Acciones</th>
            </tr>
            </thead>

            <tbody>
            {/* Usuario actual */}
            <tr
                onClick={() => ViewProfile(CurrentIdUser)}
                className="bg-transparent border-b border-gray-300 dark:border-gray-700
                        hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101 cursor-pointer"
            >
                <td className="px-2 py-2">
                <div className="flex items-center gap-2">
                    <img
                    className="w-10 h-10 rounded-full object-cover"
                    src={CurrentUserImage || DefaultImage}
                    alt="User"
                    />
                    <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {CurrentFirstName} {CurrentLastName} (Tú)
                    </div>
                    <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400">
                        {CurrentEmail}
                    </div>
                    </div>
                </div>
                </td>

                <td className="px-2 py-2">{Role}</td>

                <td className="px-2 py-2">
                    {CurrentUserPhone ? (
                    <div className="flex items-center gap-1">
                        <PhoneIcon size={18}/>
                        <a href={`${CurrentUserPhone}`} className="text-blue-500 underline pointer text-xs"> {CurrentUserPhone} </a>
                    </div>
                    ) : (
                    <div className="flex items-center gap-1">
                        <span className="text-xs"> No registrado </span>
                    </div>
                    )}
                </td>

                <td className="px-2 py-2 hidden md:table-cell">
                {CurrentDateJoined &&
                    new Date(CurrentDateJoined).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    })}
                </td>

                <td className="px-2 py-2">
                <div className="flex justify-center gap-2">
                    <button
                    onClick={e => {
                        e.stopPropagation();
                        ViewProfile(CurrentIdUser);
                    }}
                    className="flex gap-1 items-center justify-center text-white
                                bg-emerald-500 hover:bg-emerald-600
                                focus:ring-2 focus:ring-emerald-400
                                rounded-lg text-sm px-3 py-1"
                    >
                    <EyeIcon size={18} />
                    <span className="hidden md:inline">Ver perfil</span>
                    </button>
                </div>
                </td>
            </tr>

            {/* Otros usuarios */}
            {users.map((UserMap, index) => {
                const info = infos.find(i => i.user === UserMap.id);

                return (
                <tr
                    key={index}
                    className="bg-transparent border-b border-gray-300 dark:border-gray-700
                            hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101 cursor-pointer"
                >
                    <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                        <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={info?.referenciaIMG || DefaultImage}
                        alt="User"
                        />
                        <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                            {UserMap.first_name} {UserMap.last_name}
                        </div>
                        <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400">
                            {UserMap.email}
                        </div>
                        </div>
                    </div>
                    </td>

                    <td className="px-2 py-2">
                    {UserMap.groups.includes(1) && "admin"}
                    {UserMap.groups.includes(2) && "cliente"}
                    {UserMap.groups.includes(3) && "proveedor"}
                    </td>

                    <td className="px-2 py-2">
                        {info.telefono ? (
                        <div className="flex items-center gap-1">
                            <PhoneIcon size={18}/>
                            <a href={`${info.telefono}`} className="text-blue-500 underline pointer text-xs"> {info?.telefono}</a>
                        </div>
                        ) : (
                        <div className="flex items-center gap-1">
                            <span className="text-xs"> No registrado </span>
                        </div>
                        )}
                    </td>

                    <td className="px-2 py-2 hidden md:table-cell">
                    {new Date(UserMap.date_joined).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                    </td>

                    <td className="px-2 py-2">
                    <div className="flex justify-center gap-2">
                        <button
                        onClick={e => {
                            e.stopPropagation();
                            ViewProfile(UserMap.id);
                        }}
                        className="flex gap-1 items-center justify-center text-white
                                    bg-emerald-500 hover:bg-emerald-600
                                    focus:ring-2 focus:ring-emerald-400
                                    rounded-lg text-sm px-3 py-1"
                        >
                        <EyeIcon size={18} />
                        <span className="hidden md:inline">Ver perfil</span>
                        </button>

                        <button
                        // onClick={e => {
                        //     e.stopPropagation();
                        //     UserDelete(UserMap.id);
                        // }}
                        className="flex gap-1 items-center justify-center text-white
                                    bg-[#aac812ab] hover:bg-[#d5ff05cd]
                                    focus:ring-2 focus:ring-[#aac812ab]
                                    rounded-lg text-sm px-3 py-1"
                        >
                        <Key size={18} />
                        <span className="hidden md:inline">Permisos</span>
                        </button>
                    </div>
                    </td>
                </tr>
                );
            })}
            </tbody>
        </table>
        </div>

        {/* Modal Agregar Usuario */}
        {AddUserActive && (
            <div className="fixed inset-0 z-40 bg-[#83917f7c] dark:bg-[#171731] backdrop-blur-md overflow-hidden">
                <div className="h-full overflow-y-auto p-5">
                    <div className="w-full sm:w-[90%] mx-auto">
                    
                        {/* Header flotante */}
                        <div className="relative mb-6">
                            <div className="rounded-[10px] p-6 sm:p-5 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-1">
                                            Nuevo Usuario
                                        </h1>
                                        <p className="text-emerald-200">
                                            Agrega un nuevo usuario al sistema
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-1 rounded-2xl"
                                    >
                                        <X size={28} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6">
                            
                            {/* Columna Izquierda - Visual */}
                            <div className="space-y-3">
                            
                                {/* Card de Imagen */}
                                <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="p-2 bg-emerald-500/20 rounded-2xl">
                                            <ImageIcon className="w-5 h-5 text-emerald-300" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-white">Foto de Perfil</h2>
                                    </div>

                                    <div 
                                        onClick={() => setMostrarGaleria(true)}
                                        className="bg-white/5 border-2 border-dashed border-white/30 rounded-2xl p-8 text-center hover:border-emerald-400/50 hover:bg-white/10 transition-all cursor-pointer"
                                    >
                                        {imagenUsuario ? (
                                            <div className="relative inline-block">
                                                <img 
                                                    src={imagenUsuario.url} 
                                                    alt="Preview" 
                                                    className="w-32 h-32 mx-auto rounded-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeImage();
                                                    }}
                                                    className="absolute top-0 right-[calc(50%-4rem)] bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-4">
                                                    <Upload className="h-10 w-10 text-emerald-300" />
                                                </div>
                                                <p className="text-white font-medium mb-1">
                                                    Agregar imagen de perfil
                                                </p>
                                                <p className="text-emerald-200 text-sm">
                                                    Haz clic para seleccionar una imagen
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Card de Información Adicional */}
                                <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-purple-500/20 rounded-2xl">
                                            <Phone className="w-6 h-6 text-purple-300" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-white">Información Adicional</h2>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                Teléfono
                                            </label>
                                            <input
                                                type="text"
                                                name="telefono"
                                                value={formData.telefono}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                                placeholder="1234-5678"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                Dirección
                                            </label>
                                            <textarea
                                                name="direccion"
                                                value={formData.direccion}
                                                onChange={handleInputChange}
                                                rows="4"
                                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all resize-none text-white placeholder-white/50"
                                                placeholder="Dirección completa del usuario..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Columna Derecha - Datos */}
                            <div className="space-y-3">
                            
                                {/* Card de Identificación */}
                                <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-blue-500/20 rounded-2xl">
                                            <User className="w-6 h-6 text-blue-300" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-white">Identificación</h2>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                Nombre de usuario *
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                                placeholder="usuario123"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                    Nombre *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                                    placeholder="Juan"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                    Apellido *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-white/40"
                                                    placeholder="Pérez"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Card de Acceso */}
                                <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-yellow-500/20 rounded-2xl">
                                            <Mail className="w-6 h-6 text-yellow-300" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-white">
                                            Información de Acceso
                                        </h2>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                Correo electrónico *
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl
                                                        focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                                                        outline-none transition-all text-white placeholder-white/40"
                                                placeholder="usuario@email.com"
                                            />
                                        </div>

                                        {/* Password */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                    Contraseña *
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl
                                                            focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                                                            outline-none transition-all text-white placeholder-white/40"
                                                    placeholder="••••••••"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                    Confirmar contraseña *
                                                </label>
                                                <input
                                                    type="password"
                                                    name="password2"
                                                    value={formData.password2}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl
                                                            focus:ring-2 focus:ring-emerald-400 focus:border-transparent
                                                            outline-none transition-all text-white placeholder-white/40"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        {/* Estado */}
                                        {/* <div className="flex items-center gap-3 mt-2">
                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={formData.is_active}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, is_active: e.target.checked })
                                                }
                                                className="w-4 h-4 accent-emerald-500"
                                            />
                                            <span className="text-white">
                                                Usuario activo
                                            </span>
                                        </div> */}
                                    </div>
                                </div>

                                {/* Card de Rol */}
                                <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 bg-pink-500/20 rounded-2xl">
                                            <ShieldCheck className="w-6 h-6 text-pink-300" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-white">
                                            Rol del Usuario
                                        </h2>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-emerald-200 mb-2">
                                            Rol *
                                        </label>
                                        <select
                                            name="group"
                                            value={formData.group}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-white/10 border border-white/20
                                                    rounded-xl focus:ring-2 focus:ring-emerald-400
                                                    focus:border-transparent outline-none transition-all
                                                    text-white cursor-pointer"
                                        >
                                            <option value="" className="bg-emerald-600">
                                                Seleccionar rol
                                            </option>

                                            {rolesData.map((rol) => (
                                                <option
                                                    key={rol.id}
                                                    value={rol.id}
                                                    className="bg-emerald-600"
                                                >
                                                    {rol.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="mt-3 px-6">
                            <div className="flex flex-col sm:flex-row justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="px-5 py-2 bg-white/10 hover:bg-white/20
                                            border border-white/30 text-white rounded-2xl
                                            font-medium transition-all"
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCreateUser}
                                    className="px-5 py-2 bg-gradient-to-r
                                            from-emerald-500 to-emerald-600
                                            hover:from-emerald-600 hover:to-emerald-700
                                            text-white rounded-2xl font-medium transition-all
                                            shadow-lg hover:shadow-emerald-500/50
                                            flex items-center justify-center gap-2"
                                >
                                    <Plus size={20} />
                                    <span>Agregar Usuario</span>
                                </button>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        )}
    </div>
    )
};

export default UsersList

                            

