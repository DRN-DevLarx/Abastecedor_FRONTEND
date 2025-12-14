import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Tag, ArrowLeft, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShoppingCartPage = () => {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      nombre: "Lente Oftálmico Polo PH2226 Azul",
      codigo: "569453",
      precio: 3750,
      cantidad: 1,
      imagen: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200&h=200&fit=crop",
      marca: "Polo"
    },
    {
      id: 2,
      nombre: "Lente Ray-Ban Aviador Clásico",
      codigo: "RB3025",
      precio: 4200,
      cantidad: 2,
      imagen: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
      marca: "Ray-Ban"
    },
    {
      id: 3,
      nombre: "Lente Oakley Deportivo Negro",
      codigo: "OAK987",
      precio: 5500,
      cantidad: 1,
      imagen: "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=200&h=200&fit=crop",
      marca: "Oakley"
    }
  ]);

  const [cuponCode, setCuponCode] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, cantidad: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const aplicarCupon = () => {
    if (cuponCode.toUpperCase() === 'DESCUENTO10') {
      setCuponAplicado({ code: cuponCode, descuento: 0.10 });
    } else if (cuponCode.toUpperCase() === 'PRIMERA600') {
      setCuponAplicado({ code: cuponCode, descuento: 600, tipo: 'fijo' });
    } else {
      alert('Cupón no válido');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const envio = subtotal > 5000 ? 0 : 350;
  
  let descuento = 0;
  if (cuponAplicado) {
    if (cuponAplicado.tipo === 'fijo') {
      descuento = cuponAplicado.descuento;
    } else {
      descuento = subtotal * cuponAplicado.descuento;
    }
  }
  
  const total = subtotal + envio - descuento;

  return (
    <div className="min-h-screen bg-[#adb6aaa8] dark:bg-[#171731] dark:text-[#CEC19F]  ">
      {/* Header */}
      <header className="bg-[#adb6aa] dark:bg-gray-800 dark:text-[#CEC19F] shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link to={-1} className="flex items-center gap-2 text-gray-600 dark:text-white hover:text-gray-900 dark:hover:text-gray-500">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Continuar comprando</span>
            </Link>

            <h1 className="text-2xl font-bold text-gray-600 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              Carrito de Compras
            </h1>
            <div className="text-sm text-gray-600 dark:text-white">
              {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
            
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-[#adb6aa] dark:bg-gray-800 dark:text-[#ce9f9f] rounded-lg shadow-sm p-12 text-center">
                <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500 mb-6">
                  Agrega productos para comenzar tu compra
                </p>
                
                <Link to="/principal" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                  Ver productos
                </Link>

              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="bg-[#adb6aa] dark:bg-gray-800 dark:text-[#ce9f9f] rounded-lg shadow-sm p-4 sm:p-6">
                  <div className="flex gap-4">
                    {/* Imagen */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-[#ce9f9f] text-sm sm:text-base mb-1">
                            {item.nombre}
                          </h3>
                          <p className="text-sm text-gray-800 dark:text-gray-300">
                            <span className="text-blue-600">{item.marca}</span> • SKU: {item.codigo}
                          </p>
                        </div>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 p-2"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Precio y cantidad */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Control de cantidad */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 dark:text-white">Cantidad:</span>
                          <div className="flex items-center border rounded-lg">
                            <button 
                              onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                              className="p-2 hover:bg-gray-100 transition"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 font-semibold">{item.cantidad}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                              className="p-2 hover:bg-gray-100 transition"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Precio */}
                        <div className="text-right">
                          <div className="text-sm text-gray-800 dark:text-gray-400">
                            ₡{item.precio.toLocaleString('es-MX')} c/u
                          </div>
                          <div className="text-xl font-bold text-gray-900 dark:text-white">
                            ₡{(item.precio * item.cantidad).toLocaleString('es-MX')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Cupón de descuento */}
            {cartItems.length > 0 && (
              <div className="bg-[#adb6aa] dark:bg-gray-800 dark:text-[#ce9f9f] rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-[#CEC19F]">
                    ¿Tienes un cupón de descuento?
                  </h3>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Ingresa tu código"
                    value={cuponCode}
                    onChange={(e) => setCuponCode(e.target.value)}
                    className="bg-transparent flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button 
                    onClick={aplicarCupon}
                    className="bg-[#38664e] text-white px-6 py-2 rounded-lg hover:bg-[#219e5d9a] transition font-semibold"
                  >
                    Aplicar
                  </button>
                </div>
                {cuponAplicado && (
                  <div className="mt-3 text-sm text-green-600 flex items-center gap-2">
                    ✓ Cupón "{cuponAplicado.code}" aplicado correctamente
                  </div>
                )}
                <div className="mt-3 text-xs text-gray-500">
                  Cupones disponibles: DESCUENTO10, PRIMERA600
                </div>
              </div>
            )}
          </div>

          {/* Resumen de compra */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-1 pb-28 lg:pb-0">
              <div className="bg-[#adb6aa] dark:bg-gray-800  rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#CEC19F] mb-6">
                  Resumen de compra
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.cantidad, 0)} artículos)</span>
                    <span className="font-semibold">₡{subtotal.toLocaleString('es-MX')}</span>
                  </div>

                  {cuponAplicado && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span className="font-semibold">-₡{descuento.toLocaleString('es-MX')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      <span>Envío</span>
                    </div>
                    <span className="font-semibold">
                      {envio === 0 ? 'GRATIS' : `₡{envio.toLocaleString('es-MX')}`}
                    </span>
                  </div>

                  {subtotal < 5000 && (
                    <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                      💡 Agrega ₡{(5000 - subtotal).toLocaleString('es-MX')} más para envío gratis
                    </div>
                  )}

                  <div className="hidden md:inline border-t pt-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                      <span>Total</span>
                      <span className="text-2xl">₡{total.toLocaleString('es-MX')}</span>
                    </div>
                  </div>
                </div>

                <button className="hidden w-full bg-[#38664e] hover:bg-[#288655] text-white py-4 rounded-lg transition font-semibold text-lg md:flex items-center justify-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5" />
                  Proceder al pago
                </button>

                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Envío gratis en compras +₡5,000</span>
                  </div>

                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold text-gray-900 dark:text-[#CEC19F] mb-3">
                    Métodos de pago aceptados
                  </h3>
                  <div className="flex gap-2 flex-wrap dark:text-white">
                    <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded text-xs font-semibold">Efectivo</div>
                    <div className="bg-gray-100 dark:bg-gray-600 px-3 py-2 rounded text-xs font-semibold">Sinpe Móvil</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra fija inferior para móvil */}
      <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 bg-[#adb6aa] dark:bg-gray-800 border-t border-gray-300 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4 gap-4">
        {/* Precio */}
        <div className="flex flex-col">
            <span className="text-xs text-gray-700 dark:text-gray-400">Total</span>
                <span className="text-2xl font-bold">₡{total.toLocaleString('es-MX')}</span>
        
        </div>
        <button className="flex items-center justify-center gap-2 flex-1 max-w-xs bg-[#38664e] hover:bg-[#288655] active:bg-[#1f6d45] text-white font-semibold py-3.5 px-6 rounded-lg transition shadow-md">
            <ShoppingCart size={20} />
            <span> Proceder al pago ({cartItems.reduce((sum, item) => sum + item.cantidad, 0)}) </span>
        </button>
    </div>
      </div>

    </div>
  );
};

export default ShoppingCartPage;