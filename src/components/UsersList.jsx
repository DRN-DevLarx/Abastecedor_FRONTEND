import { useState, useEffect } from "react";
import { GetData } from "../services/ApiServices";
import { getCookie, GenerateToken } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import { AutenticatedUserData } from "../services/Token/AuthServices";
import { ArrowLeft, LucidePlusSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UsersList() {

    const navigate = useNavigate()
    const [UsersData, setUsersData] = useState([]);
    const [UsersInfoA, setUsersInfoA] = useState([]);

    const [SeacrhValue, setSeacrhValue] = useState("");

    const DefaultImage = "https://res.cloudinary.com/dateuzds4/image/upload/v1758219782/jpxfnohhrbfkox7sypjl.jpg";
    const [CurrentIdUser, setCurrentIdUser] = useState( );
    const [CurrentUserImage, setCurrentUserImage] = useState("");
    const [CurrentFirstName, setCurrentFirstName] = useState("");
    const [CurrentLastName, setCurrentLastName] = useState("");
    const [CurrentEmail, setCurrentEmail] = useState("");
    const [CurrentDateJoined, setCurrentDateJoined] = useState("");

    const access_token = getCookie("access_token");
    const Role = jwtDecode(access_token).role;
    
    const userQuery = AutenticatedUserData();

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
            const CurrentUserID = userQuery.data.id;
            const CurrenteUserInfo = GetUserInfo.find(CUInfo => CUInfo.user === CurrentUserID)
        
            if (CurrenteUserInfo) {
                setCurrentUserImage(CurrenteUserInfo.referenciaIMG);
                
                if(!CurrenteUserInfo.referenciaIMG) {
                setCurrentUserImage(DefaultImage);
                }
            }  
        }
        fetchData();
    }, [ userQuery.status, userQuery.data]);
    
    async function ViewProfile(Id) {

      const TOKEN = await GenerateToken({ id: Id, ViewUserAdmin: true }, "UserCookie");

      if(TOKEN) {
        navigate("/perfil")
      }
      
    }
    
    function FilterUser(UsersData, UsersInfoA, searchValue, CurrentIdUser) {
        const GROUPS_MAP = {
            1: "admin",
            2: "cliente",
            3: "proveedor"
        };

        if (!searchValue || searchValue.trim() === "") {
            // 👇 excluir el usuario actual aunque no haya búsqueda
            const users = UsersData.filter(user => user.id !== CurrentIdUser);
            const infos = UsersInfoA.filter(info => info.user !== CurrentIdUser);
            return { users, infos };
        }

        const inputLowerCase = searchValue.toLowerCase();

        const filteredUsers = UsersData.filter(user => {
            // excluye el usuario actual
            if (user.id === CurrentIdUser) return false;

            const info = UsersInfoA.find(info => info.user === user.id);

            // convertir los ids de grupos a nombres de texto
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

    let { users, infos } = FilterUser(UsersData, UsersInfoA, SeacrhValue, CurrentIdUser);
    
    return (
    
    <div class="relative w-[95%] md:w-[90%] mx-auto shadow-md sm:rounded-l" >
        <div class="flex items-center justify-between  sm:flex-row flex-wrap space-y-4 sm:space-y-0 py-3 bg-white dark:bg-gray-900">
            <button onClick={() => navigate("/admin")} class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                <ArrowLeft/>
                Volver
            </button>
           

            <div className="flex gap-3  relative w-full w-screen:[200px] sm:w-[500px]">
                <div class=" w-[80%] mx-auto">
                    <div class="absolute inset-y-0 rtl:inset-r-0 start-[4%] sm:start-[5%] flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input value={SeacrhValue} onChange={(e) => setSeacrhValue(e.target.value)} type="text" id="table-search-users" class="w-full block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar usuario"/>
                </div>

                <button onClick={() => navigate("/crearUsuario")} class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                    <LucidePlusSquare/>
                </button>
            </div>
            
            
        </div>
        <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" class="px-6 py-3">
                        Usuario
                    </th>
                    <th scope="col" class="px-3 py-3">
                        Rol
                    </th>
                    <th scope="col" class="px-3 py-3">
                        Estado
                    </th>
                    <th scope="col" class="relative top-[10px] hidden md:inline px-3 py-3">
                        Fecha de registro
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr onClick={() => ViewProfile(CurrentIdUser)} class="bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-101">

                    <th class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                        <img class="w-10 h-10 rounded-full" src={CurrentUserImage} alt="Jese image"/>
                        <div class="ps-3">
                            <div class="sm:flex gap-1 text-base font-semibold">
                                <div> {CurrentFirstName} </div>
                                <div> {CurrentLastName} (Tú) </div>
                            </div>
                            <div class="hidden md:inline font-normal text-gray-500">{CurrentEmail}</div>
                        </div>  
                    </th>

                    <td class="px-6 py-4">
                        {Role}
                    </td>

                    <td class="">
                        <div class="px-3 py-3 flex items-center">
                            <div class="h-2.5 w-2.5 rounded-full bg-green-500 me-2"></div> Online
                        </div>
                    </td>
                    
                    <td class="px-3 py-3 relative -top-[15px] hidden md:inline">
                        {new Date(CurrentDateJoined).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                </tr>

                {users.map((UserMap, index) => {
                    const info = infos.find(i => i.user === UserMap.id);

                    return ( 
                    <>
                        <tr onClick={() => ViewProfile(UserMap.id)} key={index} class="bg-white  dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-101">

                            <th class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">

                                <img class="w-10 h-10 rounded-full" 
                                src={info.referenciaIMG || DefaultImage}
                                alt="Jese image"/>
                                <div class="ps-3">
                                    <div class="sm:flex gap-1 text-base font-semibold">
                                        <div> {UserMap.first_name} </div>
                                        <div> {UserMap.last_name} </div>
                                    </div>
                                    <div class="hidden md:inline font-normal text-gray-500">{UserMap.email}</div>
                                </div>  
                            </th>

                            <td class="px-6 py-4">
                                {UserMap.groups.includes(1) && "admin"}
                                {UserMap.groups.includes(2) && "cliente"}
                                {UserMap.groups.includes(3) && "proveedor"}
                            </td>

                            <td class="">
                                <div class="px-3 py-3 flex items-center">
                                    <div class="h-2.5 w-2.5 rounded-full bg-red-500 me-2"></div> Ofline
                                </div>
                            </td>
                            
                            <td class="px-3 py-3 relative -top-[15px] hidden md:inline">
                                {UserMap ? new Date(UserMap.date_joined).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : ""}
                            </td>
                        </tr>
                    </> 
                    );
                })}

            </tbody>
        </table>
        {/* { Edit user modal } */}
        <div id="editUserModal" tabindex="-1" aria-hidden="true" class="fixed top-0 left-0 right-0 z-50 items-center justify-center hidden w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative w-full max-w-2xl max-h-full">
                {/* { Modal content } */}
                <form class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    {/* { Modal header } */}
                    <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Edit user
                        </h3>
                    <button type="button" class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="editUserModal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    </div>

                    {/* { Modal body }
                    <div class="p-6 space-y-6">
                        <div class="grid grid-cols-6 gap-6">
                            <div class="col-span-6 sm:col-span-3">
                                <label for="first-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
                                <input type="text" name="first-name" id="first-name" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Bonnie" required=""/>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="last-name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
                                <input type="text" name="last-name" id="last-name" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Green" required=""/>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                                <input type="email" name="email" id="email" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="example@company.com" required=""/>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="phone-number" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Phone Number</label>
                                <input type="number" name="phone-number" id="phone-number" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="e.g. +(12)3456 789" required=""/>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="department" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Department</label>
                                <input type="text" name="department" id="department" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Development" required=""/>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="company" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Company</label>
                                <input type="number" name="company" id="company" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="123456" required=""/>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="current-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Current Password</label>
                                <input type="password" name="current-password" id="current-password" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required=""/>
                            </div>
                            <div class="col-span-6 sm:col-span-3">
                                <label for="new-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New Password</label>
                                <input type="password" name="new-password" id="new-password" class="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="••••••••" required=""/>
                            </div>
                        </div>
                    </div>

                     { Modal footer }
                    <div class="flex items-center p-6 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                        <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save all</button>
                    </div> */}
                </form>
            </div>
        </div>
    </div>

    )
}

export default UsersList
