import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star, ArrowLeft, ShoppingCart, HeartPlus, HeartPlusIcon, X, Trash2, Move } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';

import { GetData, GetData2 } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import ProductImageSlider from "./ProductImageSlider";

import { FloatingCart } from "./FloatingCart"

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isFavorite, setIsFavorite] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [cartItems, setCartItems] = useState([]);

    const [ProductInCart, setProductInCart] = useState(0);
    const [ProductMainImage, setProductMainImage] = useState(); 
    const [ProductImages, setProductImages] = useState(); 
    const [ProductCode, setProductCode] = useState(""); 
    const [ProductQualification, setProductQualification] = useState(""); 
    const [ProductName, setProductName] = useState(""); 
    const [ProductDescription, setProductDescription] = useState(""); 
    const [ProductPrice, setProductPrice] = useState(); 
    const [ProductStock, setProductStock] = useState(); 

    useEffect(() => {
      const fetchData = async (productId, access_token) => {
        try {
            const ProductData = await GetData2(`productos/${productId}/`, access_token);
            const ProductImages = await GetData(`imagenesProducto/${productId}/`)
            
            const urls = ProductImages.map(img => img.imagen);

            setProductImages(urls)
            setProductCode(ProductData.codigo);
            setProductMainImage(ProductData.referenciaIMG);
            setProductName(ProductData.nombre);
            setProductPrice(parseInt(ProductData.precio));
            setProductDescription(ProductData.descripcion);
            setProductQualification(ProductData.calificacion);
            setProductStock(ProductData.stock);

        } catch (error) {
          console.error("Error cargando producto");
          navigate("/principal");
        }
      };
      
      const access_token = getCookie("access_token")

      if (!id || !access_token) {
        navigate("/principal");
        return;
      }

      fetchData(id, access_token);
    }, [id, navigate]);

    // Función para añadir al carrito con animación
    const addToCartWithAnimation = (e) => {
      const button = e.currentTarget;
      const buttonRect = button.getBoundingClientRect();
      const cartButton = document.getElementById('floating-cart-button');
      
      if (!cartButton) return;
      
      const cartRect = cartButton.getBoundingClientRect();

      // Crear elemento animado
      const flyingItem = document.createElement('div');
      flyingItem.innerHTML = `
        <div class="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex items-center justify-center border-2 border-[#38664e]">
          <svg class="w-8 h-8 text-[#38664e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
      `;

      flyingItem.style.position = 'fixed';
      flyingItem.style.left = `${buttonRect.left + buttonRect.width / 2 - 32}px`;
      flyingItem.style.top = `${buttonRect.top + buttonRect.height / 2 - 32}px`;
      flyingItem.style.zIndex = '9999';
      flyingItem.style.pointerEvents = 'none';
      flyingItem.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

      document.body.appendChild(flyingItem);

      // Animar después de un frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          flyingItem.style.left = `${cartRect.left + cartRect.width / 2 - 32}px`;
          flyingItem.style.top = `${cartRect.top + cartRect.height / 2 - 32}px`;
          flyingItem.style.transform = 'scale(0.3)';
          flyingItem.style.opacity = '0';
        });
      });

      // Remover elemento y agregar al carrito
      setTimeout(() => {
        flyingItem.remove();
        
        // Agregar producto al carrito
        setCartItems(prev => {
          const existingItem = prev.find(item => item.id === id);
          if (existingItem) {
            return prev.map(item =>
              item.id === id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          }
          return [...prev, {
            id: id,
            name: ProductName,
            price: ProductPrice,
            image: ProductMainImage,
            quantity: quantity
          }];
        });

        // Animación de pulso en el carrito
        const button = cartButton.querySelector('button');
        if (button) {
          button.classList.add('animate-bounce');
          setTimeout(() => {
            button.classList.remove('animate-bounce');
          }, 500);
        }
      }, 800);
    };

    const removeFromCart = (index) => {
      setCartItems(prev => prev.filter((_, i) => i !== index));
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

    const GoToCart = () => {
      navigate("/carrito")
    }

  return (
    <section className='min-h-[100vh] bg-[#adb6aaa8] dark:bg-[#171731]'>
      {/* Carrito Flotante Arrastrable con Snap */}
      <FloatingCart items={cartItems} onRemoveItem={removeFromCart} />

      {/* Header */}
      <Link to={-1} className="hidden absolute top-10 left-10 md:flex items-center gap-1 hover:scale-110">
          <ArrowLeft size={24} />
            <h2 className="text-2xl font-bold"> volver</h2>
      </Link>
        
      <div className="max-w-6xl mx-auto sm:p-10 md:py-25">
          <button>
            <Heart
              size={28}
              className={`z-20 absolute top-8 right-2  sm:top-18 sm:right-12 md:top-10 md:right-10 cursor-pointer transition-colors ${
                isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
              onClick={() => setIsFavorite(!isFavorite)}
            />
          </button>

          <div className=" grid md:grid-cols-2 gap-4 md:gap-8">
            
              {/* Sección de imagen */}
              <div className="w-full">
                <ProductImageSlider images={ProductImages} />

                {/* Descripción y Características */}
                <div className="hidden md:inline mt-12 space-y-8 px-5">
                    <div>
                    <h2 className="text-xl font-semibold text-[#21a461] mb-4">Descripción</h2>
                    <p className="text-gray-700 dark:text-gray-400 leading-relaxed">
                        {ProductDescription}
                    </p>
                    </div>

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

                  {/* Sección de información */}
                  <div className="space-y-4 px-5">
                  <div>
                      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {ProductName}
                      </h1>

                      <div className="flex items-center gap-4 text-md text-gray-600 dark:text-gray-500">
                        <span> Marca <span className="text-[#21a461]"> {ProductStock} </span></span>
                        <span> SKU {ProductCode}</span>
                      </div>
                  </div>

                  {/* Calificación */}
                  <div className="flex items-center gap-2">
                      <div className="flex">
                      {[...Array(5)].map((_, i) => (
                          <Star 
                          key={i}
                          className={`w-6 h-6 ${i < Math.floor(ProductQualification) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}`}
                          />
                      ))}
                      </div>
                      <span className="text-lg text-gray-600 dark:text-gray-400">({ProductQualification})</span>
                  </div>

                  {/* Precio */}
                  <div className="hidden md:inline text-4xl font-bold text-gray-900 dark:text-gray-100">
                      ₡ {ProductPrice}
                  </div>

                  {/* Contador de cantidad */}
                  <div>
                      <label htmlFor="quantity-input" className="block mb-2.5 text-md font-medium text-gray-900 dark:text-gray-100">
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

                  {/* Descripción y Características */}
                  <div className="md:hidden mt-5 md:mt">
                      <div>
                      <h2 className="text-xl font-semibold text-[#21a461] mb-2">Descripción</h2>
                      <p className="text-gray-700 dark:text-gray-400 leading-relaxed mb-4">
                          {ProductDescription}
                      </p>
                      </div>

                      {/* Características de compra */}
                      <div className="space-y-2 text-sm mb-4 md:mb-0">
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

                  {/* Información de pago */}
                  <div className="space-y-3 text-sm pb-25 md:pb-1">
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

                  {/* Boton Desktop */}
                  <button 
                  onClick={addToCartWithAnimation}
                  className="hidden w-full md:flex items-center justify-center gap-2 flex-1 bg-[#38664e] hover:bg-[#288655] active:bg-[#1f6d45] text-white font-semibold py-3.5 px-6 rounded-lg transition shadow-md">
                      <ShoppingCart size={20} />
                      <span>Añadir al carrito ({quantity})</span>
                  </button>
              </div>
          </div>
      </div>

      {/* Barra fija inferior para móvil */}
      {quantity > 1 ? (
        <div className="md:hidden fixed -bottom-1 left-0 right-0 z-50 bg-[#adb6aa] dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-around px-4 py-4">
            {/* Precio */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-700 dark:text-gray-400">Precio</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-[#CEC19F]">
                ₡{ProductPrice}
              </span>
            </div>
            
            {/* Contador de cantidad */}
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
            
            {/* Botón para ir al carrito móvil */}
            <button 
            onClick={GoToCart}
            className="flex items-center justify-center gap-2 flex-1 max-w-xs bg-[#38664e] hover:bg-[#288655] active:bg-[#1f6d45] text-white font-semibold py-3.5 px-6 rounded-lg transition shadow-md">
              <ShoppingCart size={20} />
              <span>Ir al carrito</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="md:hidden fixed -bottom-1 left-0 right-0 z-50 bg-[#adb6aa] dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between px-4 py-4">
            {/* Precio */}
            <div className="flex flex-col">
              <span className="text-xs text-gray-700 dark:text-gray-400">Precio</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-[#CEC19F]">
                ₡{ProductPrice}
              </span>
            </div>
            
            {/* Botón de añadir al carrito móvil */}
            <button
            onClick={addToCartWithAnimation}
            className="w-full flex items-center justify-center gap-2 flex-1 max-w-xs bg-[#38664e] hover:bg-[#288655] active:bg-[#1f6d45] text-white font-semibold py-3.5 px-6 rounded-lg transition shadow-md">
              <ShoppingCart size={20} />
              <span>Añadir al carrito ({quantity})</span>
            </button>
          </div>
        </div>
      
      )}

    </section>
  );
};

export default ProductDetail;