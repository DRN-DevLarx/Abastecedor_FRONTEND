import { GetData } from "../services/ApiServices";
import { useEffect, useState } from "react";

function CategoriesMarquee() {

    const [Categories, setCategories] = useState([])

    useEffect(() => {

        const fecthData = async () => {
            const GetCategories = await GetData("categorias/")
            
            setCategories(GetCategories)
        }
        fecthData()

    }, [])
    
  return (
    <section className="bg-[#adb6aaa8] dark:bg-[#171731] py-3 overflow-hidden">
        <style>
            {`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }

            .animate-marquee {
                display: flex;
                width: max-content;
                animation: marquee 30s linear infinite;
            }
            `}
        </style>

            <div className="relative w-full flex items-center">
                <div className="flex animate-marquee space-x-10 whitespace-nowrap">
                    
                    {Categories.map((cat, index) => (
                        <span key={index} className="text-lg font-medium px-6 py-2 bg-white/70 dark:bg-gray-800 rounded-xl shadow-md text-gray-800 dark:text-gray-200 hover:scale-105 transition-transform cursor-pointer">
                            {cat.nombre}
                        </span>
                    ))}
                </div>
            </div>

        </section>
  );
}

export default CategoriesMarquee;
