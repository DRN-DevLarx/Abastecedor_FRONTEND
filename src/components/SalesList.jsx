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

            <div className="relative w-[95%] overflow-hidden md:w-[90%] mx-auto sm:rounded-l">
            <div className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">

                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-black dark:text-white">Ventas</h2>
                    <span className="flex justify-center items-center h-6 w-6 text-sm rounded-full bg-emerald-400 text-black">
                    {paidOrders.length}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full lg:w-[65%] p-1">
                    <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 sm:top-[45%] -translate-y-1/2" />
                    <input
                        value={SearchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder="Buscar pedido por ID, cliente"
                        className="w-full ps-10 py-2 text-sm text-white placeholder-gray-100
                                border border-gray-300 rounded-lg
                                bg-emerald-400/20
                                focus:outline focus:outline-emerald-500
                                dark:border-gray-600 dark:placeholder-gray-400"
                    />
                    </div>
                </div>
                </div>

                <div className="mt-1 h-px bg-gray-300 dark:bg-gray-700" />
            </div>

            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-100 uppercase bg-emerald-600 backdrop-blur-md">
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
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {SearchValue ? "No se encontraron ventas" : "No hay ventas registradas"}
                    </td>
                    </tr>
                ) : (
                    filteredOrders.map(order => {
                    const user = UsersData.find(u => u.id === order.cliente);
                    const total = calculateTotal(order.id);

                    return (
                        <tr
                        key={order.id}
                        className="bg-transparent border-b border-gray-300 dark:border-gray-700
                                    hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101 cursor-pointer"
                        >
                        <td className="px-2 py-2 font-semibold">#{order.id}</td>

                        <td className="px-2 py-2">
                            {user ? `${user.first_name} ${user.last_name}` : "Usuario no encontrado"}
                        </td>

                        <td className="px-2 py-2">
                            {new Date(order.fecha).toLocaleDateString("es-ES")}
                        </td>

                        <td className="px-2 py-2 font-semibold">₡{total.toFixed(2)}</td>

                        <td className="px-2 py-2">
                            <div className="flex items-center gap-2">
                            <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(order.estado)}`} />
                            <span className="text-xs">{getStatusLabel(order.estado)}</span>
                            </div>
                        </td>

                        <td className="px-2 py-2">
                            <div className="flex justify-center gap-2">
                            <button
                                onClick={e => {
                                e.stopPropagation();
                                handleViewOrderDetail(order);
                                }}
                                className="flex items-center gap-1 px-3 py-1
                                        text-white bg-emerald-500 hover:bg-emerald-600
                                        focus:ring-2 focus:ring-emerald-400
                                        rounded-lg text-sm"
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

                                                        <div>
                                                            <span className="text-emerald-200">Teléfono:</span>{" "}
                                                            {userInfo.telefono ? (
                                                                <a
                                                                href={`https://wa.me/${userInfo.telefono.replace(/\D/g, "")}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 dark:text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
                                                                >
                                                                {userInfo.telefono}
                                                                </a>
                                                            ) : (
                                                                <span className="text-white">No registrado</span>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <span className="text-emerald-200">Dirección:</span>{" "}
                                                            {userInfo.direccion ? (
                                                                <p className="max-h-15 text-white break-words overflow-y-auto"> {userInfo.direccion} </p>
                                                            ) : (
                                                                <span className="tex-white">No registrada</span>
                                                            )}
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