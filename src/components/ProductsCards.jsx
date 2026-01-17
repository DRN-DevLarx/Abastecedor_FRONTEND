import DefaultProductImg from "../assets/CarouselImage.png";
import { useState, useEffect, useRef } from "react";
import { GetData } from "../services/ApiServices";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";

// ============================================
// UTILIDADES Y HELPERS
// ============================================

const filterProducts = (products, categories, searchValue, ratingFilter) => {
  return products.filter((product) => {
    const category = categories.find((cat) => cat.id == product.categoria);
    const categoryName = category ? category.nombre.toLowerCase() : "";
    const inputLowerCase = searchValue.toLowerCase();

    const matchesSearch =
      !searchValue ||
      product.nombre.toLowerCase().includes(inputLowerCase) ||
      product.codigo?.toLowerCase().includes(inputLowerCase) ||
      categoryName.includes(inputLowerCase) ||
      product.precio.toString().includes(inputLowerCase) ||
      product.stock.toString().includes(inputLowerCase);

    const matchesRating =
      ratingFilter === 0 || Math.floor(product.calificacion) === ratingFilter;

    return matchesSearch && matchesRating;
  });
};

// ============================================
// COMPONENTES
// ============================================

function ProductFilters({ searchValue, setSearchValue, ratingFilter, setRatingFilter, totalStars }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-6 md:px-10 gap-4 pb-8">
      <input
        type="text"
        placeholder="Buscar productos..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="w-full md:w-1/2 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
      />
      <div className="flex items-center gap-3">
        <label className="text-gray-800 dark:text-gray-200 text-sm">
          Filtrar por calificación:
        </label>
        <select
          value={ratingFilter}
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
  );
}

function ProductRating({ rating, totalStars }) {
  return (
    <div className="flex justify-center items-center gap-1 pb-1">
      {[...Array(totalStars)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={`${
            i < rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      ))}
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 ml-1">
        {rating}.0
      </span>
    </div>
  );
}

function ProductTitle({ title }) {
  const titleRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (el && el.scrollWidth > el.clientWidth) {
      setIsOverflowing(true);
    } else {
      setIsOverflowing(false);
    }
  }, [title]);

  return (
    <div
      ref={titleRef}
      className={`relative overflow-hidden whitespace-nowrap py-1 font-bold tracking-wide text-center uppercase text-gray-800 dark:text-white ${
        isOverflowing ? "animate-marquee" : ""
      }`}
    >
      {title}
    </div>
  );
}

function ProductCard({ product, totalStars, defaultImage }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
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

  const handleProductClick = () => {
    navigate(`/DetalleProducto/${product.id}`);
  };

  return (
    <div
      ref={cardRef}
      key={animationKey}
      className="flex flex-col items-center justify-center w-full h-[260px] sm:w-[90%] md:w-full  mx-auto group animate-fadeUp"
    >
      {/* Imagen */}
      <div
        onClick={handleProductClick}
        className="w-full h-64 bg-gray-300 bg-center bg-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105 cursor-pointer"
        style={{
          backgroundImage: `url(${product.referenciaIMG || defaultImage})`,
        }}
      />

      {/* Card Info */}
      <div className="w-[90%] -mt-12 overflow-hidden bg-white rounded-lg shadow-lg dark:bg-gray-800 transition-all duration-300 group-hover:-translate-y-1">
        <ProductTitle title={product.nombre} />
        <ProductRating rating={product.calificacion} totalStars={totalStars} />

        {/* Precio y botón */}
        <div className="flex items-center justify-between px-3 py-4 bg-gray-200 dark:bg-gray-700">
          <span className="-mt-4 font-bold text-gray-800 dark:text-gray-200">
            {product.precio}
          </span>
          <button className="-mt-2 mb-2 px-2 py-1 text-xs font-semibold text-white uppercase transition-colors duration-300 transform bg-gray-800 rounded hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-1">
            <ShoppingCart size={18} />
            <span className="hidden md:inline"> Agregar </span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ products, totalStars, defaultImage }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-10">
      {products.map((product, index) => (
        <ProductCard
          key={index}
          product={product}
          totalStars={totalStars}
          defaultImage={defaultImage}
        />
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function Products() {
  const TOTAL_STARS = 5;

  // Estado
  const [productsData, setProductsData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [ratingFilter, setRatingFilter] = useState(0);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      const [products, categories] = await Promise.all([
        GetData("productos/"),
        GetData("categorias/"),
      ]);

      if (products && categories) {
        setProductsData(products);
        setCategoriesData(categories);
      }
    };

    fetchData();
  }, []);

  // Filtrar productos
  const filteredProducts = filterProducts(
    productsData,
    categoriesData,
    searchValue,
    ratingFilter
  );

  return (
    <div className="bg-[#adb6aaa8] dark:bg-[#171731] min-h-screen py-8">
      <h1 className="text-black dark:text-white text-3xl font-semibold pl-10 pb-6">
        Productos disponibles
      </h1>

      <ProductFilters
        searchValue={searchValue}
        setSearchValue={setSearchValue}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
        totalStars={TOTAL_STARS}
      />

      <ProductGrid
        products={filteredProducts}
        totalStars={TOTAL_STARS}
        defaultImage={DefaultProductImg}
      />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          min-width: 100%;
          animation: marquee 10s linear infinite;
        }

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

export default Products;