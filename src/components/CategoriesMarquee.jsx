import { GetData } from "../services/ApiServices";
import { useEffect, useState } from "react";

function CategoriesMarquee() {

    const [Categories, setCategories] = useState([]);

    useEffect(() => {
        const fecthData = async () => {
            const GetCategories = await GetData("categorias/");
            setCategories(GetCategories);
        };
        fecthData();
    }, []);

    return (
        <section className="relative overflow-hidden bg-black dark:bg-[#0a0a1a]">
            <style>
                {`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                @keyframes glow {
                    0% { filter: hue-rotate(0deg); }
                    100% { filter: hue-rotate(360deg); }
                }

                .animate-marquee {
                    display: flex;
                    width: max-content;
                    animation: marquee 40s linear infinite;
                }

                .glow-bar {
                    animation: glow 6s linear infinite;
                }

                `}
            </style>

            {/* Glow background */}
            <div className="absolute inset-0 blur-3xl opacity-30 glow-bar bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-indigo-500" />

            <div className="relative marquee-wrapper">
                <div className="flex animate-marquee space-x-10 px-10 whitespace-nowrap">
                    {Categories.map((cat, index) => (
                        <span
                            key={index}
                            className="relative px-8 py-3 text-lg font-bold tracking-wide
                            text-white
                            transition-all duration-300 cursor-pointer
                            hover:scale-125
                            hover:shadow-[0_0_30px_rgba(236,72,153,0.9)]
                            hover:text-fuchsia-400"
                        >
                            {cat.nombre}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default CategoriesMarquee;
