import { useState, useEffect } from "react";
import { GetData } from "../services/ApiServices";
import { getCookie } from "../services/Token/sessionManager";
import { jwtDecode } from "jwt-decode";
import { AutenticatedUserData } from "../services/Token/AuthServices";
import { ArrowLeft, LucidePlusSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ProductsList() {

    const [ProductsList, setProductsList] = useState(false);
    const [ProductsData, setProductsData] = useState([]);
    const [CategoriesData, setCategoriesData] = useState([]);

    const [SearchValue, setSearchValue] = useState("");
    const DefaultImage = "https://res.cloudinary.com/dateuzds4/image/upload/v1758219782/jpxfnohhrbfkox7sypjl.jpg";

    const navigate = useNavigate();

    useEffect(() => {
    
        const token = getCookie("ProductsCookie");
    
        if (!token) {
            // No hay token → redirigir
            // navigate("/principal");
            document.cookie = "ProductsCookie=; path=/; max-age=0; secure; SameSite=Strict";
            return;
        }
    
        try {
            const decoded = jwtDecode(token);            
            setProductsList(decoded.ProductsList)
    
        } catch (error) {
            // Token inválido o modificado → redirigir
            console.warn("Token inválido:", error.message);
            navigate("/principal");
            
            document.cookie = "ProductsCookie=; path=/; max-age=0; secure; SameSite=Strict";
        }

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
    
    console.log(filteredProducts);
    
    return (
    
        <div className="relative w-[95%] md:w-[90%] mx-auto shadow-md sm:rounded-l">
            <div className="flex items-center justify-between sm:flex-row flex-wrap space-y-4 sm:space-y-0 py-3 bg-white dark:bg-gray-900">
                <button onClick={Back} className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
                    <ArrowLeft />
                    Volver
                </button>

                <div className="flex gap-3  relative w-full w-screen:[200px] sm:w-[500px]">
                    <div class=" w-[80%] mx-auto">
                        <div class="absolute inset-y-0 rtl:inset-r-0 start-[4%] sm:start-[5%] flex items-center ps-3 pointer-events-none">
                            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input value={SearchValue} onChange={(e) => setSearchValue(e.target.value)} type="text" id="table-search-users" class="w-full block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Buscar producto"/>
                    </div>

                    <button onClick={() => navigate("/crearUsuario")} class="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" type="button">
                        <LucidePlusSquare/>
                    </button>
                </div>
            </div>

            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                                className="bg-white dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-101"
                            >
                                <td className="px-6 py-4">{product.codigo || "-"}</td>
                                <td className="px-3 py-4">{product.nombre}</td>
                                <td className="px-3 py-4">${product.precio}</td>
                                <td className="px-3 py-4">{product.stock}</td>
                                <td className="px-3 py-4">{category ? category.nombre : "-"}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

    )
}

export default ProductsList
