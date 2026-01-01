import Loader from "./Loader"
import Alert, { showAlert } from "./Alert";
import { useState, useEffect } from "react";
import { GetData, PostData } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import { AutenticatedUserData } from "../services/Token/AuthServices";
import { useNavigate } from "react-router-dom";

import { LucidePlusSquare, Upload, X, Plus, Star, ArrowLeft } from 'lucide-react';

function ProductsList() {

    const [ShowLoader, setShowLoader] = useState(false);

    const [ProductsList, setProductsList] = useState(false);
    const [ProductsData, setProductsData] = useState([]);
    const [CategoriesData, setCategoriesData] = useState([]);
    const [SuppliersData, setSuppliersData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");
    const DefaultImage = "https://res.cloudinary.com/dateuzds4/image/upload/v1758219782/jpxfnohhrbfkox7sypjl.jpg";

    const navigate = useNavigate();

    useEffect(() => {
    
        // const token = getCookie("ProductsCookie");
    
        // if (!token) {
        //     // No hay token → redirigir
        //     // navigate("/principal");
        //     console.log("No hay token");
        //     document.cookie = "ProductsCookie=; path=/; max-age=0; secure; SameSite=Strict";
        //     return;
        // }
    
        // try {
        //     const decoded = jwtDecode(token);
        //     console.log(decoded);
                     
        //     setProductsList(decoded.ProductsList)
    
        // } catch (error) {
        //     // Token inválido o modificado → redirigir
        //     console.warn("Token inválido:", error.message);
        //     navigate("/principal");
            
        //     document.cookie = "ProductsCookie=; path=/; max-age=0; secure; SameSite=Strict";
        // }

        const fetchData = async () => {
            const GetProductsData = await GetData("productos/");
            const GetCategoriesData = await GetData("categorias/");
            const GetSuppliersData = await GetData("proveedores/");

            setSuppliersData(GetSuppliersData);
            
            
            const LatestProductCode = GetProductsData[GetProductsData.length - 1].codigo;
            
            // 1. Extraer la parte numérica
            const numero = parseInt(LatestProductCode.replace("PRD", ""), 10);

            // 2. Sumar 1
            const nuevoNumero = numero + 1;

            // 3. Volver a formatear con ceros (3 dígitos)
            const nuevoCodigo = "PRD" + nuevoNumero.toString().padStart(3, "0");
            setPlacehCode(nuevoCodigo);

            if ( GetProductsData && GetCategoriesData) {
                setProductsData(GetProductsData);
                setCategoriesData(GetCategoriesData);
            }
        };
        fetchData();
    }, []);

    function Back() {
        document.cookie = "ProductsCookie=; path=/; max-age=0; secure; SameSite=Strict";
        navigate("/admin")
    }

    function FilterProducts(products, categories, searchValue) {
        if (!searchValue || searchValue.trim() === "") return products;

        const inputLowerCase = searchValue.toLowerCase();        

        return products.filter(product => {
            const category = categories.find(cat => cat.id == product.categoria);
            const categoryName = category ? category.nombre.toLowerCase() : "";            

            return (
                product.nombre.toLowerCase().includes(inputLowerCase) ||
                // (product.descripcion?.toLowerCase().includes(inputLowerCase)) ||
                (product.codigo?.toLowerCase().includes(inputLowerCase)) ||
                categoryName.includes(inputLowerCase) ||
                product.precio.toString().includes(inputLowerCase) ||
                product.stock.toString().includes(inputLowerCase)
            );
        });
    }

    // Uso
    let filteredProducts = FilterProducts(ProductsData, CategoriesData, SearchValue);
    
    // console.log(ProductsData);

    // console.log(filteredProducts);
    















    const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    precio: 0,
    stock: 0,
    calificacion: 0,
    descripcion: '',
    referenciaIMG: '',
    categoria: '',
    proveedor: ''
    });

    const [imagenes, setImagenes] = useState([]);
    const [imagenPrincipal, setImagenPrincipal] = useState(null);
    const [AddProductActive, setAddProductActive] = useState(false);

    const [PlacehCode, setPlacehCode] = useState("");

    const handleClose = () => {
    setAddProductActive(false)
    };

    const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
    };

    const handleCalificacionClick = (rating) => {
    setFormData(prev => ({
        ...prev,
        calificacion: rating
    }));
    };

    const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
        id: Date.now() + Math.random(),
        url: URL.createObjectURL(file),
        file: file
    }));
    setImagenes(prev => [...prev, ...newImages]);

    if (!imagenPrincipal && newImages.length > 0) {
        setImagenPrincipal(newImages[0].id);
        setFormData(prev => ({
        ...prev,
        referenciaIMG: newImages[0].url
        }));
    }
    };

    const removeImage = (id) => {
    setImagenes(prev => prev.filter(img => img.id !== id));
    if (imagenPrincipal === id) {
        const newPrincipal = imagenes.find(img => img.id !== id);
        setImagenPrincipal(newPrincipal?.id || null);
        setFormData(prev => ({
        ...prev,
        referenciaIMG: newPrincipal?.url || ''
        }));
    }
    };

    const setAsPrincipal = (id) => {
    setImagenPrincipal(id);
    const imagen = imagenes.find(img => img.id === id);
    setFormData(prev => ({
        ...prev,
        referenciaIMG: imagen?.url || ''
    }));
    };

    const handleSubmit = async () => {

        const regex = {
            codigo: /^[A-Z0-9\-]{3,15}$/,               // opcional
            nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s]{3,100}$/, // obligatorio
            precio: /^\d{1,6}(\.\d{1,2})?$/,            // obligatorio
            stock: /^\d+$/,                             // obligatorio
            calificacion: /^[0-5]$/,                    // obligatorio
            descripcion: /^[\s\S]{0,500}$/              // opcional
        };
                
        // Campos obligatorios básicos
        if (!formData.nombre || !formData.precio) {
            showAlert("info", "Campos incompletos", "Por favor complete los campos obligatorios.");
            return;
        }

        // Código (opcional)
        const codigo = String(formData.codigo ?? "");

        if (codigo.length > 0 && (codigo.length < 3 || codigo.length > 15)) {
            showAlert("info", "Código inválido", "El código del producto debe ser vacío o tener de 3 a 15 caracteres.");
            return;
        }

        if (codigo.length === 0) {
            formData.codigo = PlacehCode;
        }

        // Nombre
        const nombre = formData.nombre.trim();

        if (nombre.length < 3) {
            showAlert("info", "Nombre inválido","El nombre del producto debe tener al menos 3 caracteres.");
            return;
        }

        if (nombre.length > 100) {
            showAlert("info", "Nombre inválido", "El nombre del producto debe tener máximo 100 caracteres.");
            return;
        }

        // Precio
        const precio = String(formData.precio);

        if (!regex.precio.test(precio)) {
            showAlert("info", "Precio inválido", "Ejemplo válido: 2000 o 900000.00");
            return;
        }

        // Stock
        const stock = String(formData.stock);

        if (!regex.stock.test(stock)) {
            showAlert("info", "Stock inválido", "El stock debe ser mayor a 0.");
            return;
        }

        // Categoría
        if (formData.categoria === "") {
            showAlert("info", "Categoría no seleccionada", "Por favor selecciona una categoría.");
            return;
        }

        // Proveedor
        if (formData.proveedor === "") {
            showAlert("info", "Proveedor no seleccionado", "Por favor selecciona un proveedor.");
            return;
        }
        
        
        setShowLoader(true)
       
        const response = await PostData("productos/", formData)
        
        setShowLoader(false)
        setAddProductActive(false)

        console.log(response);
        
        if (response.status === 200 || response.status === 201) {
            setProductsData(prev => [...prev, formData]);
            showAlert("success", "Éxito", "Producto agregado correctamente.");
        } else {
            showAlert("error", "Error", "No se pudo agregar el producto. Intente nuevamente.");
        }
    };


  











    return (
        <div className="w-[100%] min-h-[100vh] bg-[#adb6aa] dark:bg-gray-800 dark:text-[#CEC19F]">
            {ShowLoader && (
                <Loader/>
            )}
            <Alert />
            
            <div className="relative w-[95%] md:w-[90%] mx-auto shadow-md sm:rounded-l">
                <div className="flex items-center justify-between sm:flex-row flex-wrap space-y-4 sm:space-y-0 py-3 bg-transparent">
                    <button onClick={Back} className="mb-2 min-[727px]:mb-0 inline-flex items-center text-gray-100 bg-gray-400 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                        <ArrowLeft />
                        Volver
                    </button>
    
                    <div className="flex gap-3 relative w-full w-screen:[200px] sm:w-[600px] pr-0 md:pr-2">
                        <div className="w-[100%] md:w-[70%] mx-auto">
                            <div className="absolute inset-y-0 rtl:inset-r-0 start-[0%] flex items-center ps-3 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                                </svg>
                            </div>
                            <input value={SearchValue} onChange={(e) => setSearchValue(e.target.value)} type="text" id="table-search-users" className="w-full block pt-2 ps-10 text-sm text-white placeholder-gray-100 border border-gray-300 rounded-lg bg-gray-400 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar producto"/>
                        </div>
    
                        <button onClick={() => setAddProductActive(true)} className="md:w-[30%] inline-flex gap-1 items-center text-white bg-gray-400 hover:bg-[#38664e] hover:scale-105 border border-gray-300 focus:outline-none font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400" type="button">
                            <LucidePlusSquare/>
                            <p className="hidden md:inline">Agregar producto</p>
                        </button>
                    </div>
                </div>
    
                <table className=" w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-100 uppercase bg-[#38664e]">
                        <tr>
                            <th className="px-6 py-3">Código</th>
                            <th className="px-3 py-3">Nombre</th>
                            <th className="px-3 py-3">Precio</th>
                            <th className="px-3 py-3">Stock</th>
                            <th className="px-3 py-3">Categoría</th>
                        </tr>
                    </thead>
    
                    <tbody>
                        {filteredProducts.map((product, index) => {
                            const category = CategoriesData.find(cat => cat.id === product.categoria);
    
                            return (
                                <tr 
                                    key={index} 
                                    className="bg-transparent dark:border-gray-700 border-gray-300 border-b-1 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-101"
                                >
                                    <td className="px-6 py-4">{product.codigo || "-"}</td>
                                    <td className="px-3 py-4">{product.nombre}</td>
                                    <td className="px-3 py-4">₡{product.precio}</td>
                                    <td className="px-3 py-4">{product.stock}</td>
                                    <td className="px-3 py-4">{category ? category.nombre : "-"}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {AddProductActive && (
                <div className="fixed inset-0 z-50 flex md:items-center justify-center backdrop-blur-sm bg-black/30">
                    <div className="bg-[#adb6aa] dark:bg-gray-800 dark:text-[#CEC19F]  rounded-lg shadow-lg relative  w-full md:w-[70%] lg:w-[60%] xl:w-[50%] h-[100vh] md:h-[90vh] overflow-y-auto pb-2">
                    {/* Botón X en la esquina superior derecha */}
                    <button
                        onClick={handleClose}
                        className="absolute top-2 right-4 z-10 text-white hover transition-colors p-2 hover:bg-neutral-100 rounded-full"
                    >
                        <X size={30} />
                    </button>

                    <div className="p-4 border-b border-neutral-200 bg-[#38664e]">
                        <h1 className="text-xl font-normal text-white pr-10">Agregar Nuevo Producto</h1>
                    </div>

                    <div className="py-2 px-10 overflow-y-auto">
                        {/* Imágenes del Producto */}
                        <div className="mb-6 sm:mb-8">
                        <h2 className="text-base sm:text-lg font-normal mb-4">Imágenes del Producto</h2>
                        
                        <div className="bg-transparent border border-neutral-300 rounded p-6 text-center mb-0">
                            <input
                            type="file"
                            id="imageUpload"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            />
                            <label htmlFor="imageUpload" className="cursor-pointer block">
                            <Upload className="mx-auto h-8 w-8 sm:h-10 sm:w-10 mb-0" />
                            <p className="text-sm sm:text-base">Subir imágenes</p>
                            <p className="text-xs sm:text-sm mt-1">PNG, JPG, JPEG</p>
                            </label>
                        </div>

                        {imagenes.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {imagenes.map(img => (
                                <div key={img.id} className="relative group">
                                <img 
                                    src={img.url} 
                                    alt="Preview" 
                                    className={`w-full h-24 sm:h-28 object-cover rounded border ${
                                    imagenPrincipal === img.id 
                                        ? 'border-neutral-900 border-2' 
                                        : 'border-neutral-300'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(img.id)}
                                    className="absolute top-1 right-1 bg-gray-700 text-neutral-600 rounded-full p-1 shadow opacity-0 group-hover:opacity-100"
                                >
                                    <X size={14} />
                                </button>
                                {imagenPrincipal === img.id ? (
                                    <div className="absolute bottom-1 left-1 bg-neutral-900 text-white text-xs px-2 py-1 rounded">
                                    Principal
                                    </div>
                                ) : (
                                    <button
                                    type="button"
                                    onClick={() => setAsPrincipal(img.id)}
                                    className="absolute bottom-1 left-1 bg-gray-700 text-xs px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100"
                                    >
                                    Marcar
                                    </button>
                                )}
                                </div>
                            ))}
                            </div>
                        )}
                        </div>

                        {/* Información Básica */}
                        <div className="mb-6">
                        <h2 className="text-base sm:text-lg font-normal mb-4">Información Básica</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm mb-2">
                                Código <span className="text-gray-700"> (Opcional )</span>
                            </label>
                            <input
                                type="text"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleInputChange}
                                maxLength={15}
                                className="w-full px-3 py-2 border bg-transparent border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                                placeholder={PlacehCode}
                            />
                            </div>

                            <div>
                            <label className="block text-sm mb-2">
                                Nombre del Producto *
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                maxLength={100}
                                className="w-full px-3 py-2 border bg-transparent border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                                placeholder=" Ej: 1k de papas"
                            />
                            </div>

                            <div>
                            <label className="block text-sm mb-2">
                                Precio (₡) *
                            </label>
                            <input
                                type="number"
                                name="precio"
                                value={formData.precio}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-transparent border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                                placeholder="1000"
                                step="0.01"
                                min="0"
                            />
                            </div>

                            <div>
                            <label className="block text-sm mb-2">
                                Stock
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-transparent border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                                min="0"
                                placeholder="0"
                            />
                            </div>

                            <div>
                            <label className="block text-sm mb-2">
                                Categoría
                            </label>
                            <select
                                name="categoria"
                                value={formData.categoria}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-transparent border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                            >
                                <option className="bg-gray-300 dark:bg-gray-700" value="">Seleccionar</option>
                                {CategoriesData.map(cat => (
                                <option className="bg-gray-300 dark:bg-gray-700" key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                            </div>

                            <div>
                            <label className="block text-sm mb-2">
                                Proveedor
                            </label>
                            <select
                                name="proveedor"
                                value={formData.proveedor}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 bg-transparent border border-neutral-300 rounded focus:outline-none focus:border-neutral-500"
                            >
                                <option className="bg-gray-300 dark:bg-gray-700" value="">Seleccionar</option>
                                {SuppliersData.map(prov => (
                                <option className="bg-gray-300 dark:bg-gray-700" key={prov.id} value={prov.id}>{prov.nombre}</option>
                                ))}
                            </select>
                            </div>
                        </div>
                        </div>

                        {/* Calificación */}
                        {/* <div className="mb-6 sm:mb-8">
                        <h2 className="text-base sm:text-lg font-normal mb-4">Calificación</h2>
                        <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                                key={rating}
                                type="button"
                                onClick={() => handleCalificacionClick(rating)}
                            >
                                <Star
                                size={20}
                                className={`sm:w-6 sm:h-6 ${rating <= formData.calificacion ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-300'}`}
                                />
                            </button>
                            ))}
                            <span className="ml-3 text-xs sm:text-sm text-neutral-600">
                            ({formData.calificacion})
                            </span>
                        </div>
                        </div> */}

                        {/* Descripción */}
                        <div className="mb-6">
                        <h2 className="text-base sm:text-lg font-normal mb-2">Descripción</h2>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleInputChange}
                            rows="4"
                            className="w-full px-3 py-2 bg-transparent border border-neutral-300 rounded focus:outline-none focus:border-neutral-500 resize-none"
                            placeholder="Describe las características del producto..."
                        ></textarea>
                        </div>

                        {/* Botones */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-neutral-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full sm:w-auto px-5 py-2 border border-neutral-300 rounded hover:bg-gray-700 order-2 sm:order-1"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="w-full sm:w-auto px-5 py-2 bg-[#38664e] text-white rounded hover:bg-[#2aaa68] flex items-center justify-center space-x-2 order-1 sm:order-2"
                        >
                            <Plus size={18} />
                            <span>Agregar Producto</span>
                        </button>
                        </div>
                    </div>
                    </div>
                </div>
            )}
        </div>
    

    )
}

export default ProductsList
