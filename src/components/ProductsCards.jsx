import { useState, useEffect, useRef } from "react";
import { GetData } from "../services/ApiServices";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { getCookie, Logout, GenerateToken } from "../services/Token/sessionManager";

function Products() {

  const totalStars = 5;
  const [ProductsData, setProductsData] = useState([]);
  const [CategoriesData, setCategoriesData] = useState([]);
  const [SearchValue, setSearchValue] = useState("");
  const [RatingFilter, setRatingFilter] = useState(0);

  const DefaultProductImage =
    "https://res.cloudinary.com/dateuzds4/image/upload/v1758619222/x9mu7briwy28vj9od5bu.jpg";

  
  useEffect(() => {
    const fetchData = async () => {
      const GetProductsData = await GetData("productos/");
      const GetCategoriesData = await GetData("categorias/");
      if (GetProductsData && GetCategoriesData) {
        setProductsData(GetProductsData);
        setCategoriesData(GetCategoriesData);

        
        console.log(GetProductsData);
        
      }
    };
    fetchData();
  }, []);

  function FilterProducts(products, categories, searchValue, ratingFilter) {
    return products.filter((product) => {
      const category = categories.find((cat) => cat.id == product.categoria);
      const categoryName = category ? category.nombre.toLowerCase() : "";
      const inputLowerCase = searchValue.toLowerCase();

      const matchesSearch =
        !searchValue ||
        product.nombre.toLowerCase().includes(inputLowerCase) ||
        (product.codigo?.toLowerCase().includes(inputLowerCase)) ||
        categoryName.includes(inputLowerCase) ||
        product.precio.toString().includes(inputLowerCase) ||
        product.stock.toString().includes(inputLowerCase);

      const matchesRating =
        ratingFilter === 0 || Math.floor(product.calificacion) === ratingFilter;

      return matchesSearch && matchesRating;
    });
  }

  const filteredProducts = FilterProducts(
    ProductsData,
    CategoriesData,
    SearchValue,
    RatingFilter
  );
  
  return (
    <div className="bg-[#adb6aaa8] dark:bg-[#171731] min-h-screen py-8">
      <h1 className="text-black dark:text-white text-3xl font-semibold pl-10 pb-6">
        Productos disponibles
      </h1>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 gap-4 pb-8">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={SearchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full md:w-1/2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
        <div className="flex items-center gap-3">
          <label className="text-gray-800 dark:text-gray-200 text-sm">
            Filtrar por calificación:
          </label>
          <select
            value={RatingFilter}
            onChange={(e) => setRatingFilter(parseInt(e.target.value))}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <option value={0}>Todas</option>
            {[...Array(totalStars)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} ⭐ {i + 1 === 1 ? "estrella" : "estrellas"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 px-4 md:px-10">
        {filteredProducts.map((product, index) => (
          <ProductCard
            key={index}
            product={product}
            totalStars={totalStars}
            DefaultProductImage={DefaultProductImage}
          />
        ))}
      </div>

      <style>{`
        /* Movimiento marquee */
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          min-width: 100%;
          animation: marquee 10s linear infinite;
        }

        /* Animación de entrada visible SIEMPRE */
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(25px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fadeUp {
          animation: fadeUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

function ProductCard({ product, totalStars, DefaultProductImage }) {
  const navigate = useNavigate();

  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [animationKey, setAnimationKey] = useState(0); // Para reiniciar animación

  // Detectar si el título se desborda
  useEffect(() => {
    const el = titleRef.current;
    if (el && el.scrollWidth > el.clientWidth) setIsOverflowing(true);
    else setIsOverflowing(false);
  }, [product.nombre]);

  // Reinicia animación cada vez que el card entra al viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // fuerza reinicio de animación cambiando la key
            setAnimationKey((prev) => prev + 1);
          }
        });
      },
      { threshold: 0.25 }
    );
    const card = cardRef.current;
    if (card) observer.observe(card);
    return () => card && observer.unobserve(card);
  }, []);

  const SeeProductDetail = async (product) => {

    document.cookie = "ProductDetail=; path=/; max-age=0; secure; SameSite=Strict";

    const TOKEN = await GenerateToken({
      ViewUserAdmin: false, 
      id: product.id,
      codigo: product.codigo,
      calificacion: product.calificacion,
      nombre: product.nombre,
      descripcion: product.descripcion,
      precio: product.precio,
      imagen: product.referenciaIMG,
      stock: product.stock,
    }, "ProductDetail");
        
    if(TOKEN) {                
      navigate("/DetalleProducto")
    }
    
  }  

  return (
    <div ref={cardRef} key={animationKey} // reinicia animación cada vez que entra
      className="flex flex-col items-center justify-center w-full max-w-sm mx-auto group animate-fadeUp">

      {/* Imagen */}
      <div
        onClick={() => SeeProductDetail(product)}
        className="w-full h-64 bg-gray-300 bg-center bg-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
        style={{
          backgroundImage: `url(${product.referenciaIMG || DefaultProductImage})`,
        }}>

      </div>

      {/* Card */}
      <div className="w-[90%] -mt-15 overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all duration-300 group-hover:-translate-y-1">
        <div
          ref={titleRef}
          className={`relative overflow-hidden whitespace-nowrap py-2 font-bold tracking-wide text-center uppercase text-gray-800 dark:text-white ${
            isOverflowing ? "animate-marquee" : ""
          }`}
        >
          {product.nombre}
        </div>

        {/* Calificación */}
        <div className="flex justify-center items-center gap-1 pb-1">
          {[...Array(totalStars)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={`${
                i < product.calificacion
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              }`}
            />
          ))}
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">
            {product.calificacion}.0
          </span>
        </div>

        {/* Precio y botón */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-200 dark:bg-gray-700">
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {product.precio}
          </span>
          
          <button className="px-2 py-1 text-xs font-semibold text-white uppercase transition-colors duration-300 transform bg-gray-800 rounded hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-1">
            <ShoppingCart size={14} />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

export default Products;
