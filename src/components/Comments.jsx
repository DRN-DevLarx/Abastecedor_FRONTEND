import { useState, useEffect } from "react";
import { GetData } from "../services/ApiServices";

const comments = () => {

    const [UserImage, setUserImage] = useState()
    const [UserNames, setUserNames] = useState("")
    const [UserLasNames, setUserLasNames] = useState("")
    const [UserComment, setUserComment] = useState("")
    const [CommentDate, setCommentDate] = useState()
    
    // useEffect(() => {
    //   const fetch = async () => {
    //       const UsersData = await GetData("users/")
    
    //       if (UsersData) {
    //           console.log(UsersData);
              
    //       }
    //   }
    
    //   fetch();
    
    // }, []);


    const cardsData = [
        {
            image: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200',
            name: 'Briar Martin',
            handle: '@neilstellar',
            message: 'Radiant made undercutting all of our competitors an absolute breeze.',
            date: 'April 20, 2025'
        },
        {
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            name: 'Avery Johnson',
            handle: '@averywrites',
            message: 'Radiant made undercutting all of our competitors an absolute breeze.',
            date: 'May 10, 2025'
        },
        {
            image: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60',
            name: 'Jordan Lee',
            handle: '@jordantalks',
            message: 'Radiant made undercutting all of our competitors an absolute breeze.',
            date: 'June 5, 2025'
        },
        {
            image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=60',
            name: 'Avery Johnson',
            handle: '@averywrites',
            message: 'Radiant made undercutting all of our competitors an absolute breeze.',
            date: 'May 10, 2025'
        },
    ];

    const CreateCard = ({ card }) => (
        <div className="p-4 rounded-lg mx-4 border border-gray-500 shadow hover:shadow-lg transition-all duration-200 w-72 shrink-0">
            <div className="flex items-center gap-2">
                <img className="size-11 rounded-full" src={card.image} alt="User Image" />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <p>{card.name}</p>
                    </div>
                </div>
            </div>
            <p className="text-sm py-4 text-gray-500"> {card.message} </p>
            <div className="flex items-center justify-rigth text-slate-500 text-xs">
                <p>{card.date}</p>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
            @keyframes marqueeScroll {
                0% { transform: translateX(0%); }
                100% { transform: translateX(-50%); }
            }

            .marquee-inner {
                animation: marqueeScroll 30s linear infinite;
            }

            .marquee-reverse {
                animation-direction: reverse;
            }
        `}</style>

                
                <div className="bg-[#adb6aaa8] dark:bg-[#171731] pl-30 pt-20">
                    <h1 class="text-2xl font-semibold text-gray-800  lg:text-3xl dark:text-white"> ¿Que dicen nuestros clientes?</h1>
                    <div>
                        <span class="inline-block w-40 h-1 bg-[#38664e] rounded-full"></span>
                        <span class="inline-block w-3 h-1 ml-1 bg-[#38664e] rounded-full"></span>
                        <span class="inline-block w-1 h-1 ml-1 bg-[#38664e] rounded-full"></span>
                    </div>
                </div> 
            <div className="bg-[#adb6aaa8] dark:bg-[#171731] marquee-row w-full mx-auto overflow-hidden relative">

                <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></div>
                <div className="marquee-inner flex transform-gpu min-w-[200%] pt-5 pb-1">
                    {[...cardsData, ...cardsData].map((card, index) => (
                        <CreateCard key={index} card={card} />
                    ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-gray-300 dark:from-gray-700 to-transparent"></div>
            </div>

            <div className="bg-[#adb6aaa8] dark:bg-[#171731] marquee-row w-full mx-auto overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-gray-300 dark:from-gray-700 to-transparent"></div>
                <div className="marquee-inner marquee-reverse flex transform-gpu min-w-[200%] pt-10 pb-10">
                    {[...cardsData, ...cardsData].map((card, index) => (
                        <CreateCard key={index} card={card} />
                    ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-gray-300 dark:from-gray-700 to-transparent"></div>
            </div>
        </>
    )
}

export default comments