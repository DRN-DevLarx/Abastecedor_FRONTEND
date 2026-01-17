import { useState, useEffect, useRef } from "react";
import { GetData, PatchData, DeleteData, PostData } from "../services/ApiServices";
import { Box, Truck, Search, Eye, Trash2, Package, User, Calendar, DollarSign, ShoppingCart, X, CheckCircle, Clock, XCircle, Loader2, Plus, LucidePlusSquare, Minus, SwitchCamera, RefreshCcw, Edit3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Alert, { showAlert } from "./Alert";

function OrdersList() {

    const navigate = useNavigate();
    const [OrdersData, setOrdersData] = useState([]);
    const NumberOders = OrdersData.length;
    const [OrderDetailsData, setOrderDetailsData] = useState([]);
    const [UsersData, setUsersData] = useState([]);
    const [UsersInfoData, setUsersInfoData] = useState([]);
    const [ProductsData, setProductsData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");
    const [ViewOrderDetailModal, setViewOrderDetailModal] = useState(false);
    const [AddOrderActive, setAddOrderActive] = useState(false);
    const [SelectedOrder, setSelectedOrder] = useState(null);
    const [NewPaymentMethod, setNewPaymentMethod] = useState("");

    const [ChangeUser, setChangeUser] = useState(false);    

    const [changeUserSearch, setChangeUserSearch] = useState("");
    const [changeUserSelectedId, setChangeUserSelectedId] = useState(null);

    const [editingProducts, setEditingProducts] = useState([]);
    const [isEditingProducts, setIsEditingProducts] = useState(false);
    const editingContainerRef = useRef(null);

    const [formData, setFormData] = useState({
        cliente: '',
        estado: 'pendiente'
    });

    const [orderProducts, setOrderProducts] = useState([
        { producto: '', cantidad: 1, precio_unitario: 0 }
    ]);

    useEffect(() => {
        const fetchData = async () => {
            const GetOrdersData = await GetData("pedidos/");
            const GetOrderDetails = await GetData("detallePedidos/");
            const GetUsersData = await GetData("users/");
            const GetUsersInfoData = await GetData("informacionUsuarios/");
            const GetProductsData = await GetData("productosAdmin/");

            if (GetOrdersData && GetOrderDetails && GetUsersData && GetUsersInfoData && GetProductsData) {
                setOrdersData(GetOrdersData);
                setOrderDetailsData(GetOrderDetails);
                setUsersData(GetUsersData);
                setUsersInfoData(GetUsersInfoData);
                setProductsData(GetProductsData);
            }
        };
        fetchData();
    }, []);

    const FilterOrders = (orders, users, searchValue) => {
        if (!searchValue || searchValue.trim() === "") return orders;

        const inputLowerCase = searchValue.toLowerCase();

        return orders.filter(order => {
            const user = users.find(u => u.id === order.cliente);
            const userName = user ? `${user.first_name} ${user.last_name}`.toLowerCase() : "";
            const userEmail = user ? user.email.toLowerCase() : "";

            return (
                order.id.toString().includes(inputLowerCase) ||
                order.estado.toLowerCase().includes(inputLowerCase) ||
                userName.includes(inputLowerCase) ||
                userEmail.includes(inputLowerCase)
            );
        });
    };

    const calculateTotal = (orderId) => {
        const details = OrderDetailsData.filter(detail => detail.pedido === orderId);
        return details.reduce((sum, detail) => sum + (detail.cantidad * parseFloat(detail.precio_unitario)), 0);
    };

    const calculateFormTotal = () => {
        return orderProducts.reduce((sum, item) => {
            return sum + (item.cantidad * parseFloat(item.precio_unitario || 0));
        }, 0);
    };

    const getOrderDetails = (orderId) => {
        return OrderDetailsData.filter(detail => detail.pedido === orderId);
    };

    const handleViewOrderDetail = (order) => {
        setSelectedOrder(order);
        setViewOrderDetailModal(true);
    };

    const handleClose = () => {
        setAddOrderActive(false);
        setFormData({
            cliente: '',
            estado: 'pendiente'
        });
        setOrderProducts([
            { producto: '', cantidad: 1, precio_unitario: 0 }
        ]);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...orderProducts];
        updatedProducts[index][field] = value;

        if (field === 'producto') {
            const selectedProduct = ProductsData.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                updatedProducts[index].precio_unitario = selectedProduct.precio;
            }
        }

        setOrderProducts(updatedProducts);
    };

    const addProductRow = () => {
        setOrderProducts([...orderProducts, { producto: '', cantidad: 1, precio_unitario: 0 }]);
    };

    const removeProductRow = (index) => {
        if (orderProducts.length > 1) {
            setOrderProducts(orderProducts.filter((_, i) => i !== index));
        }
    };

    const ValidateFields = () => {
        if (!formData.cliente) {
            showAlert("info", "Cliente no seleccionado", "Por favor selecciona un cliente.");
            return false;
        }

        if (orderProducts.length === 0) {
            showAlert("info", "Sin productos", "Por favor agrega al menos un producto al pedido.");
            return false;
        }

        for (let i = 0; i < orderProducts.length; i++) {
            const product = orderProducts[i];
            
            if (!product.producto) {
                showAlert("info", "Producto no seleccionado", `Por favor selecciona el producto en la línea ${i + 1}.`);
                return false;
            }

            const cantidad = parseInt(product.cantidad) || 0;
            if (cantidad <= 0) {
                showAlert("info", "Cantidad inválida", `La cantidad debe ser mayor a 0 en la línea ${i + 1}.`);
                return false;
            }

            const precio = parseFloat(product.precio_unitario) || 0;
            if (precio <= 0) {
                showAlert("info", "Precio inválido", `El precio unitario debe ser mayor a 0 en la línea ${i + 1}.`);
                return false;
            }
        }

        return true;
    };

    const handleCreateOrder = async () => {
        if (!ValidateFields()) return;

        try {
            Swal.fire({
                title: "Creando pedido",
                html: "<b>Guardando información del pedido...</b>",
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                background: 'rgba(80, 80, 80, 0.75)',
                color: "white",
                didOpen: () => Swal.showLoading()
            });

            // 1️⃣ Crear pedido
            const orderPayload = {
                cliente: formData.cliente,
                estado: formData.estado
            };

            const orderResponse = await PostData("pedidos/", orderPayload);
            const orderId = orderResponse?.data?.id || orderResponse?.id;

            if (!orderId) throw new Error("Pedido no creado");

            Swal.update({
                title: "Guardando productos",
                html: "<b>Agregando productos al pedido...</b>"
            });

            // 2️⃣ Crear detalles
            await Promise.all(
                orderProducts.map(product => {
                    const detailPayload = {
                        pedido: orderId,
                        producto: product.producto ? parseInt(product.producto) : product.producto,
                        cantidad: parseInt(product.cantidad) || 0,
                        precio_unitario: parseFloat(product.precio_unitario) || 0
                    };
                    return PostData("detallePedidos/", detailPayload);
                })
            );

            Swal.close();

            showAlert("success", "¡Éxito!", "Pedido creado correctamente");

            // 3️⃣ Reset
            setAddOrderActive(false);
            setFormData({
                cliente: '',
                estado: 'pendiente'
            });
            setOrderProducts([
                { producto: '', cantidad: 1, precio_unitario: 0 }
            ]);

            // 4️⃣ Refrescar listas
            const GetOrdersData = await GetData("pedidos/");
            const GetOrderDetails = await GetData("detallePedidos/");
            setOrdersData(GetOrdersData);
            setOrderDetailsData(GetOrderDetails);

        } catch (error) {
            console.error(error);
            Swal.close();
            showAlert("error", "Error", "Ocurrió un error al crear el pedido");
        }
    };

    const CloseOrderDetail = () => {
        if(!isEditingProducts) {
            setViewOrderDetailModal(false);
            return;
        }

        Swal.fire({
            title: "¿Salir sin guardar?",
            text: "Tienes cambios sin guardar en los productos. ¿Estás seguro que deseas salir?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, salir",
            cancelButtonText: "Cancelar",
        }).then((result) => {
            if (result.isConfirmed) {
                setViewOrderDetailModal(false);
                setIsEditingProducts(false);

            }
        });
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            let pagado = false;

            if(newStatus === "entregado") {
                pagado = true;
            }

            const response = await PatchData("pedidos/", orderId, {
                estado: newStatus,
                pagado: pagado,
                metodo_pago: ""
             });

            if (response.status === 200 || response.status === 201) {
                setOrdersData(prev =>
                    prev.map(order =>
                        order.id === orderId ? { ...order, estado: newStatus, pagado: pagado, metodo_pago: "" } : order
                    )
                );

                if (SelectedOrder && SelectedOrder.id === orderId) {
                    setSelectedOrder(prev => ({ ...prev, estado: newStatus, pagado: pagado, metodo_pago: "" }));
                }
                

                showAlert("success", "ÉXITO", "Estado del pedido actualizado correctamente.");
            }
        } catch (error) {
            console.error(error);
            showAlert("error", "ERROR", "No se pudo actualizar el estado del pedido.");
        }
    };

        
    const UpdatePaymentMethod = async (orderId) => {
        
        if (!NewPaymentMethod) return;

        const now = new Date().toISOString();

        try {
            const response = await PatchData("pedidos/", orderId, {
                fecha_pago: now,
                metodo_pago: NewPaymentMethod,
                pagado: true
            });

            // actualizar estado local para reflejar el cambio visual
            setSelectedOrder(prev => ({
                ...prev,
                fecha_pago: now,
                metodo_pago: NewPaymentMethod,
                pagado: true
            }));

            console.log("Pago actualizado:", response);
            showAlert("success", "Éxito", "Método de pago actualizado correctamente.")
            
        } catch (error) {
            showAlert("error", "Error actualizando el método de pago")
    }
    };


    const handleDeleteOrder = async (id) => {
        const Delete = await Swal.fire({
            icon: "warning",
            iconColor: "red",
            title: "¿Estás seguro que deseas eliminar este pedido?",
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
            const responseDelete = await DeleteData("pedidos/", id);

            if (responseDelete.status === 204 || responseDelete.status === 201 || responseDelete.status === 200) {
                setOrdersData(prev =>
                    prev.filter(order => order.id !== id)
                );
                showAlert("success", "ÉXITO", "Pedido eliminado correctamente.");
            } else {
                showAlert("error", "ERROR", "No se pudo eliminar el pedido.");
            }
        }
    };

    const handleChangeOrderUser = (SelectUserId) => {

        try {
            PatchData("pedidos/", SelectedOrder.id, {
                cliente: parseInt(SelectUserId)
            });
        } catch (error) {
            showAlert("error", "Error al cambiar el cliente del pedido.");
        }

        setSelectedOrder(prev => ({
            ...prev,
            cliente: parseInt(SelectUserId)
        }));

        // Actualizar el pedido correspondiente dentro del array OrdersData
        setOrdersData(prev => prev.map(order =>
            order.id === SelectedOrder.id ? { ...order, cliente: parseInt(SelectUserId) } : order
        ));
    };

    const startEditingProducts = () => {
        const details = getOrderDetails(SelectedOrder.id);
        setEditingProducts(details.map(d => ({ ...d })));
        setIsEditingProducts(true);
    };

    const cancelEditingProducts = () => {
        setEditingProducts([]);
        setIsEditingProducts(false);
    };

    const handleEditProductChange = (index, field, value) => {
        const updated = [...editingProducts];
        if (field === 'producto') {
            updated[index][field] = value === '' ? '' : parseInt(value);
            const prod = ProductsData.find(p => p.id === parseInt(value));
            if (prod) updated[index].precio_unitario = prod.precio;
        } else {
            // Allow intermediate string values for cantidad and precio_unitario
            updated[index][field] = value;
        }
        setEditingProducts(updated);
    };

    const addEditProductRow = () => {
        setEditingProducts(prev => ([...prev, { producto: '', cantidad: 1, precio_unitario: 0 }]));
        // esperar a que React renderice la nueva fila y desplazar el contenedor hacia abajo
        setTimeout(() => {
            if (editingContainerRef.current) {
                editingContainerRef.current.scrollTop = editingContainerRef.current.scrollHeight;
            }
        }, 50);
    };

    const removeEditProductRow = (index) => {
        setEditingProducts(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveEditedProducts = async () => {
        try {
            // Validar que ningún campo sea nulo o inválido antes de guardar
            for (let i = 0; i < editingProducts.length; i++) {
                const item = editingProducts[i];
                const productoId = item.producto ? (typeof item.producto === 'string' ? parseInt(item.producto) : item.producto) : null;
                const cantidad = parseInt(item.cantidad) || 0;
                const precio = parseFloat(item.precio_unitario) || 0;

                if (!productoId) {
                    showAlert("info", "Producto inválido", `Selecciona un producto en el espacio ${i + 1}.`);
                    return;
                }

                if (cantidad <= 0) {
                    showAlert("info", "Cantidad inválida", `La cantidad debe ser mayor a 0 en el espacio ${i + 1}.`);
                    return;
                }

                if (precio <= 0) {
                    showAlert("info", "Precio inválido", `El precio unitario debe ser mayor a 0 en el espacio ${i + 1}.`);
                    return;
                }
            }
            // eliminar detalles que se quitaron
            const original = getOrderDetails(SelectedOrder.id);
            const originalIds = original.map(d => d.id).filter(Boolean);
            const editedIds = editingProducts.map(d => d.id).filter(Boolean);
            const idsToDelete = originalIds.filter(id => !editedIds.includes(id));

            await Promise.all(idsToDelete.map(id => DeleteData("detallePedidos/", id)));

            // actualizar o crear detalles
            await Promise.all(editingProducts.map(async (item) => {
                const payload = {
                    producto: item.producto ? parseInt(item.producto) : item.producto,
                    cantidad: parseInt(item.cantidad) || 0,
                    precio_unitario: parseFloat(item.precio_unitario) || 0
                };

                if (item.id) {
                    await PatchData("detallePedidos/", item.id, payload);
                } else {
                    await PostData("detallePedidos/", { pedido: SelectedOrder.id, ...payload });
                }
            }));

            const GetOrderDetails = await GetData("detallePedidos/");
            setOrderDetailsData(GetOrderDetails);
            setIsEditingProducts(false);
            setEditingProducts([]);
            showAlert("success", "Éxito", "Productos actualizados correctamente.");
        } catch (error) {
            console.error(error);
            showAlert("error", "Error", "No se pudieron guardar los cambios de productos.");
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

    const getStatusIcon = (estado) => {
        switch (estado) {
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

    const handleMarkAsPaid = async () => {
        try {
            const payload = {
                pagado: true,
                fecha_pago: new Date().toISOString(),
                metodo_pago: "Efectivo" // o el que uses
            };

            const response = await PatchData("pedidos/", SelectedOrder.id, payload);

            if (response.status === 200 || response.status === 201) {

                // ACTUALIZA EL MODAL
                setSelectedOrder(prev => ({
                    ...prev,
                    ...payload
                }));

                // ACTUALIZA LA LISTA
                setOrdersData(prev =>
                    prev.map(order =>
                        order.id === SelectedOrder.id
                            ? { ...order, ...payload }
                            : order
                    )
                );

                showAlert("success", "Pago registrado", "El pedido fue marcado como pagado.");
            }
        } catch (error) {
            console.error(error);
            showAlert("error", "Error", "No se pudo registrar el pago.");
        }
    };

    let filteredOrders = FilterOrders(OrdersData, UsersData, SearchValue);



    return (
        <div className="w-[100%] pb-10 min-h-[100vh] bg-[#adb6aac2] dark:bg-[#171731] dark:text-[#CEC19F]">
            <Alert />

            <div className="relative w-[95%] overflow-hidden md:w-[90%] mx-auto sm:rounded-l">
            <div className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4">

                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-black dark:text-white">Pedidos</h2>
                    <span className="flex justify-center items-center h-6 w-6 text-sm rounded-full bg-emerald-400 text-black">
                    {NumberOders}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full lg:w-[65%] p-1">
                    <div className="relative flex-1">
                    <Search size={18} className="absolute left-3 top-1/2 sm:top-[45%] -translate-y-1/2" />
                    <input
                        value={SearchValue}
                        onChange={e => setSearchValue(e.target.value)}
                        placeholder="Buscar pedido por ID, cliente o estado"
                        className="w-full ps-10 py-2 text-sm text-white placeholder-gray-100
                                border border-gray-300 rounded-lg
                                bg-emerald-400/20
                                focus:outline focus:outline-emerald-500
                                dark:border-gray-600 dark:placeholder-gray-400"
                    />
                    </div>

                    <button
                    onClick={() => setAddOrderActive(true)}
                    className="flex items-center justify-center gap-1 px-2 py-2 sm:py-0 text-sm
                                rounded-lg text-gray-400 bg-emerald-400/20
                                border border-gray-300
                                hover:bg-emerald-500 hover:text-white hover:scale-105 transition"
                    >
                    <LucidePlusSquare />Agregar pedido
                    </button>
                </div>
                </div>

                <div className="mt-1 h-px bg-gray-300 dark:bg-gray-700" />
            </div>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-100 uppercase bg-emerald-600 backdrop-blur-md">
                <tr>
                    <th className="px-2 py-3">ID Pedido</th>
                    <th className="px-2 py-3">Cliente</th>
                    <th className="hidden lg:table-cell px-2 py-3">Fecha</th>
                    <th className="px-2 py-3">Total</th>
                    <th className="px-2 py-3">Estado</th>
                    <th className="px-2 py-3 text-center">Acciones</th>
                </tr>
                </thead>

                <tbody>
                {filteredOrders.length === 0 ? (
                    <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        {SearchValue ? "No se encontraron pedidos" : "No hay pedidos registrados"}
                    </td>
                    </tr>
                ) : (
                    filteredOrders.map((order, index) => {
                    const user = UsersData.find(u => u.id === order.cliente);
                    const total = calculateTotal(order.id);

                    return (
                        <tr
                        key={index}
                        className="bg-transparent border-b border-gray-300 dark:border-gray-700
                                    hover:bg-gray-400 dark:hover:bg-gray-600 hover:scale-101 cursor-pointer"
                        >
                        <td className="px-2 py-2 font-semibold">#{order.id}</td>

                        <td className="px-2 py-2">
                            {user ? (
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {user.first_name} {user.last_name}
                            </div>
                            ) : (
                            "Usuario no encontrado"
                            )}
                        </td>

                        <td className="hidden lg:table-cell px-2 py-2">
                            {new Date(order.fecha).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            })}
                        </td>

                        <td className="px-2 py-2 font-semibold">₡{total.toFixed(2)}</td>

                        <td className="px-2 py-2">
                            <div className="flex items-center gap-1">
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
                                className="flex gap-1 items-center justify-center text-white
                                        bg-emerald-500 hover:bg-emerald-600
                                        focus:ring-2 focus:ring-emerald-400
                                        rounded-lg text-sm px-3 py-1"
                            >
                                <Eye size={18} />
                                <span className="hidden md:inline">Ver detalle</span>
                            </button>

                            <button
                                onClick={e => {
                                e.stopPropagation();
                                handleDeleteOrder(order.id);
                                }}
                                className="flex gap-1 items-center justify-center text-white
                                        bg-[#ff011f89] hover:bg-[#ff011f]
                                        focus:ring-2 focus:ring-[#ff011f]
                                        rounded-lg text-sm px-3 py-1"
                            >
                                <Trash2 size={18} />
                                <span className="hidden md:inline">Eliminar</span>
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

            {/* Modal Agregar Pedido */}
            {AddOrderActive && (
                <div className="fixed inset-0 z-40 bg-[#83917f7c] dark:bg-[#171731] backdrop-blur-md overflow-hidden">
                    <div className="h-full overflow-y-auto p-5">
                        <div className="w-full sm:w-[90%] mx-auto">

                            {/* Header flotante */}
                            <div className="relative mb-6">
                                <div className="rounded-[10px] p-6 sm:p-5 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-white mb-1">
                                                Nuevo Pedido
                                            </h1>
                                            <p className="text-emerald-200">
                                                Crea un nuevo pedido para un cliente
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

                                {/* Columna Izquierda - Info del Pedido */}
                                <div className="space-y-3">

                                    {/* Card de Cliente */}
                                    <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-blue-500/20 rounded-2xl">
                                                <User className="w-6 h-6 text-blue-300" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-white">Cliente</h2>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                Seleccionar cliente *
                                            </label>
                                            <select
                                                name="cliente"
                                                value={formData.cliente}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white cursor-pointer"
                                            >
                                                <option className="bg-emerald-600" value="">Seleccionar cliente</option>
                                                {UsersData.map(user => (
                                                    <option className="bg-emerald-600" key={user.id} value={user.id}>
                                                        {user.first_name} {user.last_name} - {user.email}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Card de Estado */}
                                    <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-purple-500/20 rounded-2xl">
                                                <Package className="w-6 h-6 text-purple-300" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-white">Estado</h2>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-emerald-200 mb-2">
                                                Estado del pedido
                                            </label>
                                            <select
                                                name="estado"
                                                value={formData.estado}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white cursor-pointer"
                                            >
                                                <option className="bg-emerald-600" value="pendiente">Pendiente</option>
                                                <option className="bg-emerald-600" value="en_proceso">En proceso</option>
                                                <option className="bg-emerald-600" value="entregado">Entregado</option>
                                                <option className="bg-emerald-600" value="cancelado">Cancelado</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Card de Total */}
                                    <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 bg-pink-500/20 rounded-2xl">
                                                <DollarSign className="w-6 h-6 text-pink-300" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-white">Total del Pedido</h2>
                                        </div>

                                        <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl">
                                            <p className="text-emerald-200 text-sm mb-1">Monto total</p>
                                            <p className="text-white text-3xl font-bold">
                                                ₡{calculateFormTotal().toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Columna Derecha - Productos */}
                                <div className="space-y-3">

                                    {/* Card de Productos */}
                                    <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/20 rounded-2xl">
                                                    <ShoppingCart className="w-6 h-6 text-emerald-300" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-white">Productos</h2>
                                            </div>
                                            <button
                                                onClick={addProductRow}
                                                className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-white rounded-lg text-sm transition-all flex items-center gap-1"
                                            >
                                                <Plus size={16} />
                                                Agregar
                                            </button>
                                        </div>

                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {orderProducts.map((item, index) => (
                                                <div key={index} className="p-4 bg-white/10 rounded-xl">
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-white font-semibold text-sm">Producto {index + 1}</p>
                                                            {orderProducts.length > 1 && (
                                                                <button
                                                                    onClick={() => removeProductRow(index)}
                                                                    className="text-red-400 hover:text-red-300"
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        <div>
                                                            <label className="block text-xs text-emerald-200 mb-1">
                                                                Producto *
                                                            </label>
                                                            <select
                                                                value={item.producto}
                                                                onChange={(e) => handleProductChange(index, 'producto', e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-white text-sm cursor-pointer"
                                                            >
                                                                <option className="bg-emerald-600" value="">Seleccionar</option>
                                                                {ProductsData.map(product => (
                                                                    <option className="bg-emerald-600" key={product.id} value={product.id}>
                                                                        {product.nombre} - ₡{product.precio}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <label className="block text-xs text-emerald-200 mb-1">
                                                                    Cantidad *
                                                                </label>
                                                                <input
                                                                        type="number"
                                                                        value={item.cantidad}
                                                                        onChange={(e) => handleProductChange(index, 'cantidad', e.target.value)}
                                                                        min="1"
                                                                        className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-white text-sm"
                                                                    />
                                                            </div>

                                                            <div>
                                                                <label className="block text-xs text-emerald-200 mb-1">
                                                                    Precio Unit. *
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    value={item.precio_unitario}
                                                                    onChange={(e) => handleProductChange(index, 'precio_unitario', e.target.value)}
                                                                    step="0.01"
                                                                    min="0"
                                                                    className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-white text-sm"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="pt-2 border-t border-white/10">
                                                            <p className="text-xs text-emerald-200">Subtotal</p>
                                                            <p className="text-white font-bold">
                                                                ₡{(item.cantidad * parseFloat(item.precio_unitario || 0)).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
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
                                        onClick={handleCreateOrder}
                                        className="px-5 py-2 bg-gradient-to-r
                                                from-emerald-500 to-emerald-600
                                                hover:from-emerald-600 hover:to-emerald-700
                                                text-white rounded-2xl font-medium transition-all
                                                shadow-lg hover:shadow-emerald-500/50
                                                flex items-center justify-center gap-2"
                                    >
                                        <Plus size={20} />
                                        <span>Agregar Pedido </span>
                                    </button>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ver Detalle del Pedido */}
            {ViewOrderDetailModal && SelectedOrder && (
                <div className="fixed inset-0 z-40 bg-[#83917f7c] dark:bg-[#171731] backdrop-blur-md overflow-hidden">
                    <div className="h-full overflow-y-auto p-5">
                        <div className="w-full sm:w-[90%] lg:w-[80%] mx-auto">

                            {/* Header flotante */}
                            <div className="relative mb-6">
                                <div className="rounded-[10px] p-6 sm:p-5 shadow-2xl">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h1 className="text-2xl font-bold text-white mb-1">
                                                Detalle del Pedido #{SelectedOrder.id}
                                            </h1>
                                            <p className="text-emerald-200">
                                                Información completa del pedido
                                            </p>
                                        </div>
                                        <button
                                            onClick={CloseOrderDetail}
                                            className="text-white/80 hover:text-white hover:bg-white/10 transition-all p-1 rounded-2xl"
                                        >
                                            <X size={28} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">

                                {/* Columna Izquierda - Info General */}
                                <div className="space-y-3">
                                    <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl space-y-6">

                                        {/* Información del Cliente */}
                                        <div className="relative flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/20 rounded-2xl">
                                                    <User className="w-6 h-6 text-blue-300" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-white">Cliente</h2>
                                            </div>
                                            <button
                                                onClick={() => setChangeUser(!ChangeUser)}
                                                className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-white rounded-lg text-sm transition-all flex items-center gap-1"
                                            >
                                                {ChangeUser ? (
                                                    <span className="flex items-center gap-1">
                                                        <X size={16} />
                                                        Cancelar
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1">
                                                        <RefreshCcw size={16} />
                                                        Cambiar
                                                    </span>
                                                )}
                                            </button>

                                            {ChangeUser && (
                                            <div className="absolute z-[60] bg-gray-500/90 p-6 w-[100%] sm:w-[80%] lg:w-[100%] top-7 mt-4 sm:left-[10%] lg:left-0 rounded-md shadow-2xl">

                                                <label className="block text-sm font-medium text-emerald-200 mb-2">Seleccionar nuevo cliente </label>

                                                <input
                                                    type="text"
                                                    placeholder="Buscar cliente por nombre, usuario o email"
                                                    value={changeUserSearch}
                                                    onChange={(e) => setChangeUserSearch(e.target.value)}
                                                    className="w-full px-3 py-2 mb-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white placeholder-emerald-500"
                                                />

                                                <div className="max-h-40 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
                                                    {(() => {
                                                        const q = changeUserSearch.toLowerCase();
                                                        const filtered = UsersData.filter(u => {
                                                            const fullname = `${u.first_name} ${u.last_name}`.toLowerCase();
                                                            return !q || fullname.includes(q) || u.username.toLowerCase().includes(q) || (u.email && u.email.toLowerCase().includes(q));
                                                        });

                                                        if (filtered.length === 0) {
                                                            return (
                                                                <div className="px-3 py-2 text-sm text-emerald-200">No se encontraron usuarios</div>
                                                            );
                                                        }

                                                        return filtered.map(user => (
                                                            <div key={user.id} className={`flex items-center justify-between px-3 py-2 hover:bg-white/10 ${SelectedOrder.cliente === user.id ? 'bg-emerald-600/20' : ''}`}>
                                                                <div className="text-white text-sm">
                                                                    {user.first_name} {user.last_name} <span className="text-emerald-200 text-xs">- {user.username}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => { handleChangeOrderUser(user.id); setChangeUser(false); }}
                                                                        className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm"
                                                                    >
                                                                        Seleccionar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ));
                                                    })()}
                                                </div>

                                            </div>
                                            )}
                                        </div>

                                        {(() => {
                                            const user = UsersData.find(u => u.id === SelectedOrder.cliente);
                                            const userInfo = UsersInfoData.find(u => u.id === SelectedOrder.cliente);

                                            return user && userInfo ? (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white text-sm items-center">

                                                {/* Imagen */}
                                                <div className="flex justify-center md:order-2">
                                                    <img
                                                        className="w-25 h-25 md:w-20 md:h-20 lg:w-25 lg:h-25 rounded-full object-cover border-2 border-emerald-400"
                                                        src={userInfo.referenciaIMG}
                                                        alt="Perfil"
                                                    />
                                                </div>

                                                {/* Datos */}
                                                <div className="md:col-span-2 space-y-2 md:order-1">

                                                    <p>
                                                        <span className="text-emerald-200">Nombre:</span>{" "}
                                                        {user.first_name} {user.last_name}
                                                    </p>

                                                    <p>
                                                        <span className="text-emerald-200">Email:</span>{" "}
                                                        <a
                                                        href={`mailto:${user.email}`}
                                                        className="text-blue-600 dark:text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition"
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


                                            ) : (
                                                <p className="text-white">Cliente no encontrado</p>
                                            );
                                        })()}

                                        {/* Fecha del Pedido */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-purple-500/20 rounded-2xl">
                                                    <Calendar className="w-6 h-6 text-purple-300" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-white">Fecha</h2>
                                            </div>
                                            <p className="text-white text-lg">
                                                {new Date(SelectedOrder.fecha).toLocaleDateString("es-ES", {
                                                    weekday: 'long',
                                                    day: "2-digit",
                                                    month: "long",
                                                    year: "numeric",
                                                    // hour: '2-digit',
                                                    // minute: '2-digit'
                                                })}
                                            </p>
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
                                                    <span className="text-white font-semibold">
                                                        {getStatusLabel(SelectedOrder.estado)}
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    <p className="text-emerald-200 text-sm">Cambiar estado:</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {["pendiente", "en_preparacion", "empacado", "enviado", "entregado", "cancelado"].map((estado) => (
                                                            <button
                                                                key={estado}
                                                                onClick={() => handleUpdateStatus(SelectedOrder.id, estado)}
                                                                className={`px-3 py-2 rounded-lg text-sm transition-all
                                                                    ${SelectedOrder.estado === estado
                                                                        ? "bg-emerald-600 text-white"
                                                                        : "bg-white/10 hover:bg-white/20 text-white"
                                                                    }`}
                                                            >
                                                                {getStatusLabel(estado)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estado de Pago */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-green-500/20 rounded-2xl">
                                                    <DollarSign className="w-6 h-6 text-green-300" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-white">Estado de pago</h2>
                                            </div>

                                            {SelectedOrder.pagado ? (
                                                SelectedOrder.metodo_pago ? (

                                                    <div className="space-y-2 text-white text-sm">
                                                    <div className="flex items-center gap-2 text-green-400 font-semibold">
                                                        <CheckCircle size={18} /> Pagado
                                                    </div>

                                                    <p>
                                                        <span className="text-emerald-200">Fecha:</span>{" "}
                                                        {SelectedOrder.fecha_pago
                                                        ? new Date(SelectedOrder.fecha_pago).toLocaleString("es-ES")
                                                        : "—"}
                                                    </p>

                                                    <p>
                                                        <span className="text-emerald-200">Método:</span>{" "}
                                                        {SelectedOrder.metodo_pago}
                                                    </p>
                                                    </div>

                                                ) : (

                                                    <div className="space-y-2">
                                                    <p className="text-white text-sm font-semibold">
                                                        Seleccione método de pago
                                                    </p>

                                                    <select
                                                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400 focus:border-transparent outline-none transition-all text-white cursor-pointer"
                                                    value={NewPaymentMethod}
                                                    onChange = {(e) => setNewPaymentMethod(e.target.value)}
                                                    >
                                                        <option className="bg-emerald-500" value="efectivo">Efectivo</option>
                                                        <option className="bg-emerald-500" value="sinpe_movil">Sinpe Móvil</option>
                                                    </select>

                                                    <button
                                                        disabled={!NewPaymentMethod}
                                                        onClick={() => UpdatePaymentMethod(SelectedOrder.id, NewPaymentMethod)}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 rounded-lg text-white transition"
                                                        >
                                                        Guardar método de pago
                                                    </button>
                                                    </div>

                                                )
                                            ) : (

                                            <div className="flex items-center gap-2 text-yellow-300 font-semibold">
                                                <Clock size={18} /> Pendiente de pago
                                            </div>

                                            )}

                                        </div>

                                    </div>
                                </div>

                                {/* Columna Derecha - Productos y Total */}
                                <div className="space-y-3">
                                    <div className="backdrop-blur-xl rounded-[10px] p-6 shadow-2xl space-y-6">

                                        {/* Productos */}
                                        <div>
                                            <div className="flex items-center justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/20 rounded-2xl">
                                                        <ShoppingCart className="w-6 h-6 text-emerald-300" />
                                                    </div>
                                                    <h2 className="text-xl font-semibold text-white">Productos</h2>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {!isEditingProducts ? (
                                                        <button onClick={startEditingProducts} className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-white rounded-lg text-sm transition-all flex items-center gap-1">
                                                            <Edit3 size={16} />
                                                            Editar
                                                        </button>
                                                    ) : (
                                                    <>
                                                        <button onClick={addEditProductRow} className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500 text-white rounded-lg text-sm transition-all flex items-center gap-1">
                                                            <Plus size={14} />
                                                            Agregar
                                                        </button>
                                                        <button onClick={handleSaveEditedProducts} className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-all">
                                                            Guardar
                                                        </button>
                                                        <button onClick={cancelEditingProducts} className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-all">
                                                            Cancelar
                                                        </button>
                                                    </>
                                                    )}
                                                </div>
                                            </div>

                                            <div ref={editingContainerRef} className="space-y-3 max-h-96 overflow-y-auto">
                                                    {!isEditingProducts ? (
                                                        getOrderDetails(SelectedOrder.id).map((detail, idx) => {
                                                            const product = ProductsData.find(p => p.id === detail.producto);
                                                            const subtotal = detail.cantidad * parseFloat(detail.precio_unitario);
                                                            return (
                                                                <div key={idx} className="p-4 bg-white/10 rounded-xl">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <div className="flex-1">
                                                                            <p className="text-white font-semibold">{product ? product.nombre : "Producto no encontrado"}</p>
                                                                            <p className="text-emerald-200 text-sm">{product ? product.codigo : "N/A"}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                                        <div>
                                                                            <p className="text-emerald-200">Cantidad</p>
                                                                            <p className="text-white font-semibold">{detail.cantidad}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-emerald-200">Precio Unit.</p>
                                                                            <p className="text-white font-semibold">₡{parseFloat(detail.precio_unitario).toFixed(2)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-emerald-200">Subtotal</p>
                                                                            <p className="text-white font-semibold">₡{subtotal.toFixed(2)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        editingProducts.map((item, index) => {
                                                            const prod = ProductsData.find(p => p.id === parseInt(item.producto));
                                                            return (
                                                                <div key={index} className="p-4 bg-white/10 rounded-xl">
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <p className="text-white font-semibold">Producto {index + 1}</p>
                                                                        {editingProducts.length > 1 && (
                                                                            <button onClick={() => removeEditProductRow(index)} className="text-red-400 hover:text-red-300">
                                                                                <Minus size={16} />
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <div>
                                                                            <label className="block text-xs text-emerald-200 mb-1">Producto *</label>
                                                                            <select
                                                                                value={item.producto}
                                                                                onChange={(e) => handleEditProductChange(index, 'producto', e.target.value)}
                                                                                className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-white text-sm cursor-pointer"
                                                                            >
                                                                                <option className="bg-emerald-600" value="">Seleccionar</option>
                                                                                {ProductsData.map(p => (
                                                                                    <option className="bg-emerald-600" key={p.id} value={p.id}>{p.nombre} - ₡{p.precio}</option>
                                                                                ))}
                                                                            </select>

                                                                        </div>

                                                                        <div className="grid grid-cols-2 gap-2">
                                                                            <div>
                                                                                <label className="block text-xs text-emerald-200 mb-1">Cantidad *</label>
                                                                                                        <input type="number" min="1" value={item.cantidad} onChange={(e) => handleEditProductChange(index, 'cantidad', e.target.value)} className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-white text-sm" />
                                                                            </div>
                                                                            <div>
                                                                                <label className="block text-xs text-emerald-200 mb-1">Precio Unit. *</label>
                                                                                <input type="number" min="0" step="0.01" value={item.precio_unitario} onChange={(e) => handleEditProductChange(index, 'precio_unitario', e.target.value)} className="w-full px-2 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-400 outline-none text-white text-sm" />
                                                                            </div>
                                                                        </div>

                                                                        <div className="pt-2 border-t border-white/10">
                                                                            <p className="text-xs text-emerald-200">Subtotal</p>
                                                                            <p className="text-white font-bold">₡{((item.cantidad || 0) * parseFloat(item.precio_unitario || 0)).toFixed(2)}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                        </div>

                                        {/* Total del Pedido */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-pink-500/20 rounded-2xl">
                                                    <DollarSign className="w-6 h-6 text-pink-300" />
                                                </div>
                                                <h2 className="text-xl font-semibold text-white">Total</h2>
                                            </div>

                                            <div className="p-4 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl">
                                                <p className="text-emerald-200 text-sm mb-1">Monto total a pagar</p>
                                                <p className="text-white text-3xl font-bold">
                                                    ₡{calculateTotal(SelectedOrder.id).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </div>

                            {/* Botones de acción */}
                            <div className="mt-3 px-6">
                                <div className="flex flex-col sm:flex-row justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setViewOrderDetailModal(false)}
                                        className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-2xl font-medium transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default OrdersList