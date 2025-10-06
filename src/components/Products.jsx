import { useState, useEffect } from "react";
import { GetData } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, LucidePlusSquare } from "lucide-react";

function Products() {
    const totalStars = 5;

    const [ProductsData, setProductsData] = useState([]);
    const [CategoriesData, setCategoriesData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");
    const DefaultProductImage = "https://res.cloudinary.com/dateuzds4/image/upload/v1758619222/x9mu7briwy28vj9od5bu.jpg";

    const navigate = useNavigate();

    useEffect(() => {

        const fetchData = async () => {
            const GetProductsData = await GetData("productos/");
            const GetCategoriesData = await GetData("categorias/");

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
        
    return (
        <div className="bg-[#adb6aaa8] dark:bg-[#171731]">
            <h1 className='text-white text-3xl p-3 pl-10'> Productos disponibles</h1>

            <div className="pb-10 w-[100%] mx-auto py-1 px-2 min-[600px]:px-8     gap-2 sm:gap-4 lg:gap-4 md:px-5 md:py-3 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                
                {filteredProducts.map((product, index) => (
                    <div key={index} class="bg-[#adb6aa] w-full max-w-sm mb-2 border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <button className="w-full h-50 min-[600px]:h-55">
                            <img class="opacity-90 h-full w-full object-cover p-[10%] pb-2 rounded-t-lg" src={product.referenciaIMG || DefaultProductImage} alt="product image" />
                        </button>

                        <div class="px-5 pb-5">
                            <a href="#">
                                <h5 class="h-[60px] overflow-auto text-[20px] sm:text-[22px] lg:text-[25px] lg:h-[80px] font-semibold tracking-tight text-gray-900 dark:text-white"> {product.nombre} </h5>
                            </a>

                            <div class="flex items-center mt-2.5 mb-3">
                                {[...Array(totalStars)].map((_, index) => {

                                    return index < product.calificacion ? (
                                    <svg
                                        key={index}
                                        className="w-5 h-5 text-yellow-300"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 22 20"
                                    >
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    ) : (
                                    <svg
                                        key={index}
                                        className="w-5 h-5 text-gray-200 dark:text-gray-600"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="currentColor"
                                        viewBox="0 0 22 20"
                                    >
                                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                                    </svg>
                                    );
                                    
                                })}
                                <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-sm dark:bg-blue-200 dark:text-blue-800 ms-3">{product.calificacion}.0</span>
                            </div>

                            <div class=" flex items-center justify-between">
                                <span class="text-[20px] sm:text-[20px] lg:text-[25px] font-bold text-gray-900 dark:text-white">
                                    ₡{Math.round(product.precio)} {/* redondear al más cercano */ }
                                </span>
                                <button class="text-white bg-blue-800 hover:scale-120 hover:bg-blue-500 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-1 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    <ShoppingCart/>
                                </button>

                            </div>
                        </div>  
                    </div>
                ))}         
            </div>

        </div>
    );
}

export default Products;
