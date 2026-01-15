import { useState, useEffect } from "react";
import { GetData } from "../services/ApiServices";
import { Search, Eye, User, Calendar, DollarSign, ShoppingCart, Clock, CheckCircle, X, Package, Box, Truck, XCircle } from "lucide-react";
import Alert from "./Alert";

function SalesList() {
    const [OrdersData, setOrdersData] = useState([]);
    const [OrderDetailsData, setOrderDetailsData] = useState([]);
    const [UsersData, setUsersData] = useState([]);
    const [UsersInfoData, setUsersInfoData] = useState([]);
    const [ProductsData, setProductsData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");
    const [ViewOrderDetailModal, setViewOrderDetailModal] = useState(false);
    const [SelectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const GetOrdersData = await GetData("pedidos/");
            const GetOrderDetails = await GetData("detallePedidos/");
            const GetUsersData = await GetData("users/");
            const GetUsersInfoData = await GetData("informacionUsuarios/");
            const GetProductsData = await GetData("productosAdmin/");

            if (GetOrdersData) setOrdersData(GetOrdersData);
            if (GetOrderDetails) setOrderDetailsData(GetOrderDetails);
            if (GetUsersData) setUsersData(GetUsersData);
            if (GetUsersInfoData) setUsersInfoData(GetUsersInfoData);
            if (GetProductsData) setProductsData(GetProductsData);
        };
        fetchData();
    }, []);

    const FilterOrders = (orders, users, searchValue) => {
        if (!searchValue || searchValue.trim() === "") return orders;
        const q = searchValue.toLowerCase();
        return orders.filter((order) => {
            const user = users.find((u) => u.id === order.cliente);
            const name = user ? `${user.first_name} ${user.last_name}`.toLowerCase() : "";
            const email = user ? (user.email || "").toLowerCase() : "";
            return (
                order.id.toString().includes(q) ||
                (order.estado || "").toLowerCase().includes(q) ||
                name.includes(q) ||
                email.includes(q)
            );
        });
    };

    const getOrderDetails = (orderId) => {
        return OrderDetailsData.filter((d) => d.pedido === orderId);
    };

    const calculateTotal = (orderId) => {
        const details = getOrderDetails(orderId);
        return details.reduce((sum, d) => sum + (d.cantidad * parseFloat(d.precio_unitario || 0)), 0);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pendiente":
                return <Clock className="text-yellow-400" />;
            case "en_preparacion":
                return <Package className="text-blue-400" />;
            case "empacado":
                return <Box className="text-purple-400" />;
            case "enviado":
                return <Truck className="text-indigo-400" />;
            case "entregado":
                return <CheckCircle className="text-green-400" />;
            case "cancelado":
                return <XCircle className="text-red-400" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pendiente":
                return "bg-yellow-500";
            case "en_proceso":
                return "bg-blue-500";
            case "entregado":
                return "bg-green-500";
            case "cancelado":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    };

    const getStatusLabel = (estado) => {
        const labels = {
            pendiente: "Pendiente",
            en_preparacion: "En preparación",
            empacado: "Empacado",
            enviado: "Enviado",
            entregado: "Entregado",
            cancelado: "Cancelado",
        };
        return labels[estado] || estado;
    };

    const paidOrders = OrdersData.filter((o) => o.pagado === true);
    const filteredOrders = FilterOrders(paidOrders, UsersData, SearchValue);

    const handleViewOrderDetail = (order) => {
        setSelectedOrder(order);
        setViewOrderDetailModal(true);
    };

    const closeDetail = () => {
        setViewOrderDetailModal(false);
        setSelectedOrder(null);
    };

    return (
        <div className="w-full pb-10 min-h-screen bg-[#adb6aac2] dark:bg-[#171731] dark:text-[#CEC19F]">
            <Alert />
            <div className="relative w-[95%] md:w-[90%] mx-auto">


                {/* <div className="flex items-center justify-between py-3 gap-1">
                    <h2 className="text-2xl font-bold">Ventas ({paidOrders.length})</h2>

                    <div className="flex gap-3 w-[80%]">
                        <div className="w-full relative">
                            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                <Search size={18} />
                            </div>
                            <input
                                value={SearchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                type="text"
                                className="w-full ps-10 text-sm text-white rounded-lg bg-gray-400 px-3 py-2"
                                placeholder="Buscar pedido por ID, cliente o estado"
                            />
                        </div>

                        <button disabled className="hiddenpx-3 py-2 bg-gray-500/50 text-white rounded-lg">Agregar (solo lectura)</button>
                    </div>
                </div> */}


                <div className="flex items-center justify-between lg:justify-around sm:flex-row flex-wrap space-y-4 sm:space-y-0 py-3 gap-1 bg-transparent">

                    <h2 className="text-black dark:text-white text-2xl font-bold mt-2 mb-2 md:pl-2 text-center">Ventas ({paidOrders.length}) </h2>
    
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
                                placeholder="Buscar pedido por ID, cliente"
                            />
                        </div>
    
                        {/* <button 
                            onClick={() => setAddUserActive(true)} 
                            className="md:w-[30%] lg:w-[50%] xl:w-[30%] inline-flex gap-1 items-center justify-center text-white bg-gray-400 hover:bg-[#38664e] hover:scale-105 border border-gray-300 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400" 
                            type="button"
                        >
                            <LucidePlusSquare/>
                            <p className="hidden md:inline">Agregar usuario</p>
                        </button> */}
                    </div>
                </div>

                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-100 uppercase bg-[#3f763081]">
                        <tr>
                            <th className="px-2 py-3">ID Pedido</th>
                            <th className="px-2 py-3">Cliente</th>
                            <th className="px-2 py-3">Fecha</th>
                            <th className="px-2 py-3">Total</th>
                            <th className="px-2 py-3">Estado</th>
                            <th className="px-2 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center">
                                    {SearchValue ? "No se encontraron ventas" : "No hay ventas registradas"}
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => {
                                const user = UsersData.find((u) => u.id === order.cliente);
                                const total = calculateTotal(order.id);
                                return (
                                    <tr key={order.id}
                                        className="bg-transparent dark:border-gray-700 border-gray-300 border-b-1 hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101 cursor-pointer">
                                        <td className="px-2 py-2 font-semibold">#{order.id}</td>
                                        <td className="px-2 py-2">{user ? `${user.first_name} ${user.last_name}` : "Usuario no encontrado"}</td>
                                        <td className="px-2 py-2">{new Date(order.fecha).toLocaleDateString("es-ES")}</td>
                                        <td className="px-2 py-2 font-semibold">₡{total.toFixed(2)}</td>
                                        <td className="px-2 py-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(order.estado)}`}></div>
                                                <span className="text-xs">{getStatusLabel(order.estado)}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-2">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewOrderDetail(order);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-2 bg-[#0191ff60] text-white rounded-lg"
                                                >
                                                    <Eye size={16} />
                                                    <span className="hidden md:inline">Ver detalle</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                            )}
                        </tbody>
                </table>
            </div>

            {ViewOrderDetailModal && SelectedOrder && (
                <div className="fixed inset-0 z-40 bg-[#83917f7c] dark:bg-[#171731] backdrop-blur-md overflow-auto">
                    <div className="p-5 w-full sm:w-[90%] lg:w-[80%] mx-auto">

                        {/* Header flotante */}
                        <div className="relative mb-6">
                            <div className="rounded-[10px] p-6 sm:p-5 shadow-2xl">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-1">
                                            Detalle de venta #{SelectedOrder.id}
                                        </h1>   
                                        <p className="text-emerald-200">
                                            Información completa del pedido
                                        </p>
                                    </div>
                                    <button
                                        onClick={closeDetail}
                                        className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-1 rounded-2xl"
                                    >
                                        <X size={28} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl space-y-6">

                                    {/* Información del Cliente */}
                                    <div className="relative flex items-center justify-between mb-4 shadow-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/20 rounded-2xl">
                                                <User className="w-6 h-6 text-blue-300" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-white">Cliente</h2>
                                        </div>
                                    </div>

                                    {(() => {
                                        const user = UsersData.find((u) => u.id === SelectedOrder.cliente);
                                        const userInfo = UsersInfoData.find((u) => u.id === SelectedOrder.cliente);
                                        if (user && userInfo) {
                                            return (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-sm items-center">
                                                    
                                                <div className="flex justify-center md:order-2">
                                                    <img
                                                        className="w-25 h-25 md:w-20 md:h-20 lg:w-25 lg:h-25 rounded-full object-cover border-2 border-emerald-400"
                                                        src={userInfo.referenciaIMG}
                                                        alt="Perfil"
                                                    />
                                                </div>

                                                    <div className="md:col-span-2 space-y-2 md:order-1 overflow-hidden">
                                                        <p>
                                                            <span className="text-emerald-200">Nombre:</span>{" "}
                                                            {user.first_name} {user.last_name}
                                                        </p>

                                                        <p className="flex gap-1">
                                                            <span className="text-emerald-200">Email:</span>{" "}
                                                            <a
                                                            href={`mailto:${user.email}`}
                                                            className="overflow-x-auto text-blue-600 dark:text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
                                                            >
                                                            {user.email}    
                                                            </a>
                                                        </p>

                                                        <p>
                                                            <span className="text-emerald-200">Teléfono:</span>{" "}
                                                            <a
                                                                href={`https://wa.me/${userInfo.telefono.replace(/\D/g, "")}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-blue-600 dark:text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
                                                            >
                                                                {userInfo.telefono}
                                                            </a>
                                                        </p>


                                                        <div>
                                                            <span className="text-emerald-200">Dirección:</span>{" "}
                                                            <p className="p-2 bg-white/10 max-h-20 break-words overflow-auto scrollbar-custom scrollbar-thin scrollbar-thumb-emerald-400 scrollbar-track-transparent">{userInfo.direccion}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return <p className="text-white">Cliente no encontrado</p>;
                                    })()}

                                    {/* Fecha del Pedido */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-purple-500/20 rounded-2xl">
                                                <Calendar className="w-6 h-6 text-purple-300" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-white">Fecha</h2>
                                        </div>
                                        <p className="text-white text-lg">{new Date(SelectedOrder.fecha).toLocaleDateString("es-ES", { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                    </div>

                                    {/* Estado del Pedido */}
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-yellow-500/20 rounded-2xl">
                                                <Package className="w-6 h-6 text-yellow-300" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-white">Estado</h2>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                                                {getStatusIcon(SelectedOrder.estado)}
                                                <span className="text-white font-semibold">{getStatusLabel(SelectedOrder.estado)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h2 className="text-xl font-semibold">Productos</h2>
                                    <div className="space-y-3 max-h-96 overflow-y-auto mt-3">
                                        {getOrderDetails(SelectedOrder.id).map((detail) => {
                                            const prod = ProductsData.find((p) => p.id === detail.producto);
                                            const subtotal = detail.cantidad * parseFloat(detail.precio_unitario || 0);
                                            return (
                                                <div key={detail.id} className="p-4 bg-white/10 rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-white font-semibold">{prod ? prod.nombre : 'Producto no encontrado'}</p>
                                                            <p className="text-emerald-200 text-sm">{prod ? prod.codigo : 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <p className="text-emerald-200">Cantidad</p>
                                                            <p className="text-white font-semibold">{detail.cantidad}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-emerald-200">Precio Unit.</p>
                                                            <p className="text-white font-semibold">₡{parseFloat(detail.precio_unitario || 0).toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-emerald-200">Subtotal</p>
                                                            <p className="text-white font-semibold">₡{subtotal.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold">Total</h2>
                                    <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl mt-3">
                                        <p className="text-3xl font-bold">₡{calculateTotal(SelectedOrder.id).toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button onClick={closeDetail} className="px-5 py-2 bg-white/10 rounded-2xl">Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SalesList;