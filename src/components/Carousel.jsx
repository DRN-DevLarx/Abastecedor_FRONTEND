import React, { useState, useEffect } from "react";
import CarouselImage from "../assets/CarouselImage.png";
import CarouselImage2 from "../assets/logo.png";

// Puedes agregar más imágenes aquí
const images = [CarouselImage, CarouselImage, CarouselImage];

function Carousel3D() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-[#adb6aaa8] dark:bg-[#171731] overflow-hidden border-b-2 border-gray-700">
      {/* Escenario 3D */}
      <div
        className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px]"
        style={{
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateY(${currentIndex * -360 / images.length}deg)`,
          transition: "transform 1s ease-in-out",
        }}
      >
        {images.map((src, i) => {
          const angle = (360 / images.length) * i;
          return (
            <img
              key={i}
              src={src}
              alt={`Slide ${i + 1}`}
              className="absolute w-full h-full object-cover rounded-xl shadow-2xl"
              style={{
                transform: `rotateY(${angle}deg) translateZ(400px)`,
                transition: "transform 1s ease-in-out",
              }}
            />
          );
        })}
      </div>

      {/* Botones */}
      <button
        onClick={handlePrev}
        className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-gray-900 rounded-full p-3 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 6 10"
        >
          <path d="M5 1 1 5l4 4" />
        </svg>
      </button>

      <button
        onClick={handleNext}
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-gray-900 rounded-full p-3 transition"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 6 10"
        >
          <path d="m1 9 4-4-4-4" />
        </svg>
      </button>

      {/* Indicadores */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex
                ? "bg-white scale-125"
                : "bg-gray-400 hover:bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel3D;
