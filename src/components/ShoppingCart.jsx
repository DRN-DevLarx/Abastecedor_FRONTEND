import React, { useEffect, useState } from 'react';
import {
  ShoppingCart, Trash2, Plus, Minus, Tag,
  ArrowLeft, CreditCard, Truck
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { GetData2 } from '../services/ApiServices';
import { decodeJwt } from 'jose';
import Alert, { showAlert } from "./Alert";
import { getCookie } from '../services/Token/sessionManager';

const ShoppingCartPage = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [cuponCode, setCuponCode] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  
  const allSelected = cartItems.length > 0 && cartItems.every(item => item.seleccionado);

  /* ================== FETCH ================== */
  useEffect(() => {
    const fetchData = async (access_token) => {
      try {
        const response = await GetData2("carritoActivo/", access_token);

        const mappedItems = response.items.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: Number(item.producto.precio),
          nombre: item.producto.nombre,
          codigo: item.producto.codigo,
          imagen: item.producto.referenciaIMG,
          seleccionado: item.seleccionado ?? true
        }));

        console.log(response);
        console.log(mappedItems);
        

        setCartItems(mappedItems);
      } catch (error) {
        console.error(error);
        navigate("/principal");
        showAlert("warning", "Error", "Error al cargar el carrito");
      }
    };

    const access_token = getCookie("access_token");
    if (!access_token) {
      navigate("/principal");
      return;
    }

    fetchData(access_token);
  }, [navigate]);
  
  /* ============== Marcar/desmarcar todos ================== */
  const toggleSelectAll = () => {
    const allSelected = cartItems.every(item => item.seleccionado);
    setCartItems(items =>
      items.map(item => ({ ...item, seleccionado: !allSelected }))
    );
  };

  /* ================== ACCIONES ================== */
  const updateQuantity = (id, cantidad) => {
    if (cantidad < 1) return;
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, cantidad } : item
      )
    );
  };

  const toggleSeleccionado = (id) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, seleccionado: !item.seleccionado }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const aplicarCupon = () => {
    if (cuponCode.toUpperCase() === 'DESCUENTO10') {
      setCuponAplicado({ code: cuponCode, descuento: 0.10 });
    } else if (cuponCode.toUpperCase() === 'PRIMERA600') {
      setCuponAplicado({ code: cuponCode, descuento: 600, tipo: 'fijo' });
    } else {
      showAlert("warning", "Cupón", "Cupón no válido");
    }
  };

  /* ================== CÁLCULOS ================== */
  const selectedItems = cartItems.filter(item => item.seleccionado);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + item.precio * item.cantidad,
    0
  );

  const envio = subtotal > 5000 || subtotal === 0 ? 0 : 350;

  let descuento = 0;
  if (cuponAplicado && subtotal > 0) {
    descuento =
      cuponAplicado.tipo === 'fijo'
        ? cuponAplicado.descuento
        : subtotal * cuponAplicado.descuento;
  }

  const total = subtotal + envio - descuento;

  /* ================== RENDER ================== */
  return (
    <div className="min-h-screen bg-[#adb6aaa8] dark:bg-[#171731]">
      <Alert />

      {/* HEADER */}
      <header className="bg-[#adb6aa] dark:bg-gray-800 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to={-1} className="flex items-center gap-2">
            <ArrowLeft />
            <span className="hidden sm:inline">Continuar comprando</span>
          </Link>

          <h1 className="text-xl font-bold flex items-center gap-2">
            <ShoppingCart /> Carrito
          </h1>

          <div className="flex items-center gap-2">
            <input
              id='select'
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
                    className="w-5 h-5 rounded-full accent-transparent text-emerald-500 outline-0 focus:ring-emerald-500"
            />
            <label htmlFor='select' className="font-semibold text-gray-700 dark:text-gray-200">
              Todos
            </label>
          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 grid lg:grid-cols-3 gap-8">

        {/* LISTA */}
        <div className="lg:col-span-2 space-y-0">
          {cartItems.map(item => (
            <>
              <div key={item.id} className=" rounded-lg p-4">
                <div className="flex gap-4 items-center">

                  {/* CHECK */}
                  <input bg-red-500
                    type="checkbox"
                    checked={item.seleccionado}
                    onChange={() => toggleSeleccionado(item.id)}
                    className="w-7 h-7 rounded-full accent-transparent text-emerald-500 outline-0 focus:ring-emerald-500"
                  />

                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-28 h-28 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold">{item.nombre}</h3>
                        <p className="text-sm">Código: {item.codigo}</p>
                      </div>

                      <button onClick={() => removeItem(item.id)}>
                        <Trash2 className="text-red-500" />
                      </button>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(item.id, item.cantidad - 1)}>
                          <Minus />
                        </button>
                        <span className="font-bold">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, item.cantidad + 1)}>
                          <Plus />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg">
                          ₡{item.precio.toLocaleString('es-MX')}
                        </div>
                        {/* {item.seleccionado && (
                          <div className="font-bold text-lg">
                            ₡{(item.precio * item.cantidad).toLocaleString('es-MX')}
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='w-full flex my-0 justify-end'>
                <hr className='border-gray-500 w-[80%]'/>
              </div>
            </>
          ))}
          
        </div>

        {/* RESUMEN */}
        <div className="bg-[#adb6aa] dark:bg-gray-800 rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Resumen</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₡{subtotal.toLocaleString('es-MX')}</span>
            </div>

            {cuponAplicado && subtotal > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento</span>
                <span>-₡{descuento.toLocaleString('es-MX')}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Envío</span>
              <span>{envio === 0 ? "GRATIS" : `₡${envio}`}</span>
            </div>

            <hr />

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>₡{total.toLocaleString('es-MX')}</span>
            </div>
          </div>

          <button
            disabled={selectedItems.length === 0}
            className="w-full mt-6 bg-[#38664e] disabled:bg-gray-400 text-white py-3 rounded-lg flex justify-center gap-2"
          >
            <CreditCard /> Proceder al pago ({selectedItems.length})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCartPage;
