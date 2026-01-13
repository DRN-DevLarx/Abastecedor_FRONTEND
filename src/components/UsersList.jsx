import Default_Image from "../assets/Default_Image.jpg";
import { useState, useEffect } from "react";
import { GetData, PostData, DeleteData } from "../services/ApiServices";
import { getCookie, GenerateToken } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import { AutenticatedUserData } from "../services/Token/AuthServices";
import { LucidePlusSquare, Search, EyeIcon, Trash2, X, Plus, User, Mail, Phone, IdCard, Upload, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Alert, { showAlert } from "./Alert";
import cloudDinaryServices from '../services/cloudDinaryServices';

function UsersList() {

    const navigate = useNavigate()
    const [UsersData, setUsersData] = useState([]);
    const NumberUsers = UsersData.length;
    const [UsersInfoA, setUsersInfoA] = useState([]);
    // const [rolesData, setRolesData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");

    const DefaultImage = Default_Image;
    const [CurrentIdUser, setCurrentIdUser] = useState();
    const [CurrentUserImage, setCurrentUserImage] = useState();
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

    const rolesData = [
    { "id": 1, "name": "admin" },
    { "id": 2, "name": "clienet" },
    { "id": 3, "name": "proveedor" }
    ]


    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        password2: "",
        is_active: true,
        group: "",          // 👈 un solo rol
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

            if(GetUsersData && GetUserInfo) {
                setUsersData(GetUsersData)
                setUsersInfoA(GetUserInfo)
            }
            
            // filtrar usuario por id
            const CurrentUserID = userQuery.data?.id;
            const CurrenteUserInfo = GetUserInfo?.find(CUInfo => CUInfo.user === CurrentUserID)
        
            if (CurrenteUserInfo) {
                setCurrentUserImage(CurrenteUserInfo.referenciaIMG);
                
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
        const GROUPS_MAP = {
            1: "admin",
            2: "cliente",
            3: "proveedor"
        };

        if (!searchValue || searchValue.trim() === "") {
            const users = UsersData.filter(user => user.id !== CurrentIdUser);
            const infos = UsersInfoA.filter(info => info.user !== CurrentIdUser);
            return { users, infos };
        }

        const inputLowerCase = searchValue.toLowerCase();

        const filteredUsers = UsersData.filter(user => {
            if (user.id === CurrentIdUser) return false;

            const info = UsersInfoA.find(info => info.user === user.id);
            const groupNames = user.groups?.map(id => GROUPS_MAP[id]?.toLowerCase()) || [];

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
        if (!formData.username || !formData.first_name || !formData.last_name || !formData.email || !formData.password) {
            showAlert("info", "Campos incompletos", "Por favor complete todos los campos obligatorios.");
            return false;
        }

        if (formData.username.length < 3) {
            showAlert("info", "Usuario inválido", "El nombre de usuario debe tener al menos 3 caracteres.");
            return false;
        }

        if (formData.password.length < 6) {
            showAlert("info", "Contraseña inválida", "La contraseña debe tener al menos 6 caracteres.");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showAlert("info", "Email inválido", "Por favor ingresa un email válido.");
            return false;
        }

        if (formData.groups.length === 0) {
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
            }

            Swal.update({
                title: "Creando usuario",
                html: "<b>Guardando información del usuario...</b>"
            });

            Swal.showLoading();

            const userPayload = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email,
                password: formData.password,
                groups: formData.groups
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

            Swal.close();

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
            Swal.close();
            showAlert("error", "Error", "Ocurrió un error al agregar el usuario");
        }
    };

    let { users, infos } = FilterUser(UsersData, UsersInfoA, SearchValue, CurrentIdUser);
    
    return (
        <div className="w-[100%] pb-10 min-h-[100vh] bg-[#adb6aac2] dark:bg-[#171731] dark:text-[#CEC19F]">
            <Alert />
            
            <div className="relative w-[95%] md:w-[90%] mx-auto sm:rounded-l">
                <div className="flex items-center justify-between lg:justify-around sm:flex-row flex-wrap space-y-4 sm:space-y-0 py-3 gap-1 bg-transparent">

                    <h2 className="text-black dark:text-white text-2xl font-bold mt-2 mb-2 md:pl-2 text-center">Usuarios ({NumberUsers}) </h2>
    
                    <div className="flex gap-3 relative w-full lg:w-[80%] pr-0 md:pr-2">
                        <div className="w-[100%] md:w-[90%] mx-auto">
                            <div className="absolute inset-y-0 rtl:inset-r-0 start-[0%] flex items-center ps-3 pointer-events-none">
                                <Search size={18}/>
                            </div>
                            <input 
                                value={SearchValue} 
                                onChange={(e) => setSearchValue(e.target.value)} 
                                type="text" 
                                id="table-search-users" 
                                className="w-full block pt-2 ps-10 text-sm text-white placeholder-gray-100 border border-gray-300 rounded-lg bg-gray-400 focus:ring-[#38664e] focus:border-[#38664e] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-[#38664e] dark:focus:border-[#38664e]" 
                                placeholder="Buscar usuario"
                            />
                        </div>
    
                        <button 
                            onClick={() => setAddUserActive(true)} 
                            className="md:w-[30%] lg:w-[50%] xl:w-[30%] inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] hover:scale-105 border border-gray-300 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400" 
                            type="button"
                        >
                            <LucidePlusSquare/>
                            <p className="hidden md:inline">Agregar usuario</p>
                        </button>
                    </div>
                </div>
    
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-100 uppercase bg-[#3f763081] backdrop-blur-md">
                        <tr>
                            <th className="px-2 py-3">Usuario</th>
                            <th className="px-2 py-3">Rol</th>
                            <th className="px-2 py-3">Estado</th>
                            <th className="px-2 py-3 hidden md:table-cell">Fecha de registro</th>
                            <th className="px-2 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
    
                    <tbody>
                        {/* Usuario actual */}
                        <tr 
                            onClick={() => ViewProfile(CurrentIdUser)} 
                            className="bg-transparent dark:border-gray-700 border-gray-300 border-b-1 hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101 cursor-pointer"
                        >
                            <td className="px-2 py-2">
                                <div className="flex items-center gap-2">
                                    <img className="w-10 h-10 rounded-full object-cover" src={CurrentUserImage || DefaultImage} alt="User image"/>
                                    <div>
                                        <div className="font-semibold text-gray-900 dark:text-white">
                                            {CurrentFirstName} {CurrentLastName} (Tú)
                                        </div>
                                        <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400">{CurrentEmail}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-2 py-2">{Role}</td>
                            <td className="px-2 py-2">
                                <div className="flex items-center gap-1">
                                    <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                                    <span className="text-xs">Online</span>
                                </div>
                            </td>
                            <td className="px-2 py-2 hidden md:table-cell">
                                {CurrentDateJoined && new Date(CurrentDateJoined).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-2 py-2">
                                <div className="flex justify-center gap-2">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            ViewProfile(CurrentIdUser);
                                        }} 
                                        className="flex gap-1 items-center justify-center text-white bg-[#0191ff60] hover:bg-[#0191ff] focus:ring-2 focus:outline-none focus:ring-[#0191ff] font-medium rounded-lg text-sm px-3 py-2"
                                    >
                                        <EyeIcon size={18}/>
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
                                    className="bg-transparent dark:border-gray-700 border-gray-300 border-b-1 hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101 cursor-pointer"
                                >
                                    <td className="px-2 py-2">
                                        <div className="flex items-center gap-2">
                                            <img 
                                                className="w-10 h-10 rounded-full object-cover" 
                                                src={info?.referenciaIMG || DefaultImage}
                                                alt="User image"
                                            />
                                            <div>
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {UserMap.first_name} {UserMap.last_name}
                                                </div>
                                                <div className="hidden md:block text-xs text-gray-500 dark:text-gray-400">{UserMap.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2">
                                        {UserMap.groups.includes(1) && "admin"}
                                        {UserMap.groups.includes(2) && "cliente"}
                                        {UserMap.groups.includes(3) && "proveedor"}
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="flex items-center gap-1">
                                            <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                                            <span className="text-xs">Offline</span>
                                        </div>
                                    </td>
                                    <td className="px-2 py-2 hidden md:table-cell">
                                        {UserMap && new Date(UserMap.date_joined).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                                    </td>
                                    <td className="px-2 py-2">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    ViewProfile(UserMap.id);
                                                }} 
                                                className="flex gap-1 items-center justify-center text-white bg-[#0191ff60] hover:bg-[#0191ff] focus:ring-2 focus:outline-none focus:ring-[#0191ff] font-medium rounded-lg text-sm px-3 py-2"
                                            >
                                                <EyeIcon size={18}/>
                                                <span className="hidden md:inline">Ver perfil</span>
                                            </button>

                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    UserDelete(UserMap.id);
                                                }} 
                                                className="flex gap-1 items-center justify-center text-white bg-[#ff011f89] hover:bg-[#ff011f] focus:ring-2 focus:outline-none focus:ring-[#ff011f] font-medium rounded-lg text-sm px-3 py-2"
                                            >
                                                <Trash2 size={18}/>
                                                <span className="hidden md:inline">Eliminar</span>
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

                            

