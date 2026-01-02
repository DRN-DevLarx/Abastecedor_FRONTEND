import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';

import { GetData, PostData, PatchData, DeleteUserData, DeleteData } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";

const ProductDetail = () => {

    const { id } = useParams();

    const navigate = useNavigate();
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [ViewUserAdmin, setViewUserAdmin] = useState(); 

    const [ProductCode, setProductCode] = useState(""); 
    const [ProductQualification, setProductQualification] = useState(""); 
    const [ProductName, setProductName] = useState(""); 
    const [ProductDescription, setProductDescription] = useState(""); 
    const [ProductPrice, setProductPrice] = useState(); 
    const [ProductImage, setProductImage] = useState(); 
    const [ProductStock, setProductStock] = useState(); 
  
  const caracteristicas = {
    marca: "Polo",
    genero: "Hombre",
    edad: "Adulto",
    forma: "Cuadrado",
    estilo: "Marco Completo",
    material: "Pasta",
    color: "Azul"
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < ProductStock) {
      setQuantity(quantity + 1);
    }
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= ProductStock) {
      setQuantity(value);
    } else if (e.target.value === '') {
      setQuantity('');
    }
  };

  const handleBlur = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(1);
    } else if (quantity > ProductStock) {
      setQuantity(ProductStock);
    }
  };



useEffect(() => {

  const fetchData = async (productId) => {
    try {
      const ProductData = await GetData(`productos/${productId}/`);

      if (ProductData) {
        setProductCode(ProductData.codigo);
        setProductImage(ProductData.referenciaIMG);
        setProductName(ProductData.nombre);
        setProductPrice(ProductData.precio);
        setProductDescription(ProductData.descripcion);
        setProductQualification(ProductData.calificacion);
        setProductStock(ProductData.stock);
      }
    } catch (error) {
      console.error("Error cargando producto");
      navigate("/principal");
    }
  };

  const token = getCookie("ProductId");

  // 🟢 1. Si hay ID en la URL → usarlo
  if (id) {
    fetchData(id);
    return;
  }

  // 🟡 2. Si no hay ID pero hay token → validarlo
  if (token) {
    try {
      const decoded = jwtDecode(token);

      if (decoded?.id) {
        fetchData(decoded.id);
        return;
      }
    } catch (error) {
      console.warn("Token inválido");
    }
  }

  // 🔴 3. Nada válido → limpiar y redirigir
  document.cookie = "ProductId=; path=/; max-age=0; SameSite=Strict";
  navigate("/principal");

}, [id, navigate]);




  return (
    <section className='bg-[#adb6aaa8] dark:bg-[#171731]'>
        {/* Header */}
        <Link to={-1} className="absolute top-10 left-10 flex items-center gap-1 hover:scale-110">
            <ArrowLeft size={24} />
             <h2 className="text-2xl font-bold"> volver</h2>
        </Link>
        
        <div className="max-w-6xl mx-auto px-6 py-25">
            <div className=" grid md:grid-cols-2 gap-8">
                {/* Sección de imagen */}
                <div className="space-y-4">
                    <div className="relative bg-gray-50 rounded-lg p-8">
                        <img 
                        src={ProductImage} 
                        alt={ProductName}
                        className="w-full h-auto object-contain"
                        />
                        <div className="absolute top-4 right-4">
                        <button
                            onClick={() => setIsFavorite(!isFavorite)}
                            className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition"
                        >
                            <Heart 
                            className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                            />
                        </button>
                        </div>
                        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md">
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md">
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                    
                    {/* Miniaturas */}
                    <div className="flex gap-2 justify-center">
                        <button className="w-16 h-16 border-2 border-blue-500 rounded-lg p-1">
                        <img src={ProductImage} alt="" className="w-full h-full object-contain" />
                        </button>
                        <button className="w-16 h-16 border-2 border-gray-200 rounded-lg p-1">
                        <img src={ProductImage} alt="" className="w-full h-full object-contain opacity-50" />
                        </button>
                    </div>

                    {/* Descripción y Características */}
                    <div className="mt-12 space-y-8">
                        <div>
                        <h2 className="text-xl font-semibold text-[#21a461] mb-4">Descripción</h2>
                        <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                            {ProductDescription}
                        </p>
                        </div>

                        <div>
                        <h2 className="text-xl font-semibold text-[#21a461] mb-4">Características</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <div className="flex">
                                <span className="font-semibold w-32">Marca:</span>
                                <span className="text-gray-700 dark:text-gray-400">{caracteristicas.marca}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Género:</span>
                                <span className="text-gray-700 dark:text-gray-400">{caracteristicas.genero}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Edad:</span>
                                <span className="text-gray-700 dark:text-gray-400">{caracteristicas.edad}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Forma:</span>
                                <span className="text-gray-700 dark:text-gray-400">{caracteristicas.forma}</span>
                            </div>
                            </div>
                            <div className="space-y-2">
                            <div className="flex">
                                <span className="font-semibold w-32">Estilo:</span>
                                <span className="text-gray-700 dark:text-gray-400">{caracteristicas.estilo}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Material:</span>
                                <span className="text-gray-700 dark:text-gray-400">{caracteristicas.material}</span>
                            </div>
                            <div className="flex">
                                <span className="font-semibold w-32">Color Armazón:</span>
                                <span className="text-gray-700 dark:text-gray-400">{caracteristicas.color}</span>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                </div>

                    {/* Sección de información */}
                    <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {ProductName}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-500">
                        <span>Marca <span className="text-[#21a461]">Polo</span></span>
                        <span>SKU {ProductCode}</span>
                        </div>
                    </div>

                    {/* Calificación */}
                    <div className="flex items-center gap-2">
                        <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(ProductQualification) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
                            />
                        ))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">({ProductQualification})</span>
                    </div>

                    {/* Precio */}
                    <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                        ₡ {ProductPrice}
                    </div>


                    {/* Stock */}
                    {/* <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Stock disponible:</span> {ProductStock} unidades
                        </p>
                    </div> */}

                    {/* Contador de cantidad */}
                    <div>
                        <label htmlFor="quantity-input" className="block mb-2.5 text-sm font-medium text-gray-900 dark:text-gray-100">
                        Cantidad:
                        </label>

                        <div className="relative flex items-center max-w-[9rem] shadow-sm rounded-md">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={quantity <= 1}
                            className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 font-medium rounded-l-md text-sm px-3 focus:outline-none h-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg 
                            className="w-4 h-4" 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            fill="none" 
                            viewBox="0 0 24 24"
                            >
                            <path 
                                stroke="currentColor" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M5 12h14"
                            />
                            </svg>
                        </button>

                        <input
                            type="text"
                            id="quantity-input"
                            value={quantity}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            className="border-x-0 h-10 text-center w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        />

                        <button
                            type="button"
                            onClick={handleIncrement}
                            disabled={quantity >= ProductStock}
                            className="text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-white focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 font-medium rounded-r-md text-sm px-3 focus:outline-none h-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg 
                            className="w-4 h-4" 
                            aria-hidden="true" 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="24" 
                            height="24" 
                            fill="none" 
                            viewBox="0 0 24 24"
                            >
                            <path 
                                stroke="currentColor" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth="2" 
                                d="M5 12h14m-7 7V5"
                            />
                            </svg>
                        </button>
                        </div>
                    </div>

                    {/* Información de pago */}
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                        <span className="text-orange-500">💳</span>
                        <div>
                            <p>Págalo con <span className="font-semibold">kuestaPay</span> a 4 quincenas de</p>
                            <p className="font-semibold">₡938, ¡con 0% interés!</p>
                        </div>
                        </div>

                        <div className="flex items-start gap-2">
                        <span className="text-orange-500">📦</span>
                        <div>
                            <p className="font-semibold">Envío GRATIS</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">
                            Recíbelo entre el Jueves 28 de Julio y el Martes 2 de Agosto
                            </p>
                        </div>
                        </div>

                        <div className="flex items-start gap-2">
                        <span className="text-orange-500">🏷️</span>
                        <div>
                            <p className="font-semibold">Promociones Activas</p>
                            <p className="text-gray-600 dark:text-gray-400">60% en todos los tratamientos</p>
                            <p className="text-gray-600 dark:text-gray-400">Hasta 9 Meses sin intereses</p>
                        </div>
                        </div>

                        <div className="bg-transparent border dark:border-orange-200 rounded-lg p-3">
                        <p className="text-[#21a461] font-semibold">
                            🎁 Cupón de 600 en tu primer compra
                        </p>
                        </div>
                    </div>

                    {/* Boton */}
                    <button className="hidden w-full md:flex items-center justify-center gap-2 flex-1 bg-[#38664e] hover:bg-[#288655] active:bg-[#1f6d45] text-white font-semibold py-3.5 px-6 rounded-lg transition shadow-md">
                        <ShoppingCart size={20} />
                        <span>Añadir al carrito ({quantity})</span>
                    </button>

                    {/* Características de compra */}
                    <div className="space-y-2 text-sm mb-10 md:mb-0">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Envío Gratis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-green-600">✓</span>
                            <span>Compra Segura</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      {/* Barra fija inferior para móvil */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 bg-[#adb6aa] dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4 gap-4">
          {/* Precio */}
          <div className="flex flex-col">
            <span className="text-xs text-gray-700 dark:text-gray-400">Precio</span>
            <span className="text-2xl font-bold text-gray-900 dark:text-[#CEC19F]">
              ₡{ProductPrice}
            </span>
          </div>

          {/* Botón de añadir al carrito */}
          <button className="flex items-center justify-center gap-2 flex-1 max-w-xs bg-[#38664e] hover:bg-[#288655] active:bg-[#1f6d45] text-white font-semibold py-3.5 px-6 rounded-lg transition shadow-md">
            <ShoppingCart size={20} />
            <span>Añadir al carrito ({quantity})</span>
          </button>
        </div>
      </div>

    </section>

  );
};

export default ProductDetail;