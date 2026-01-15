import React, { useState, useEffect, useRef } from "react";
import Image1 from "../assets/image1.png";
import Image2 from "../assets/image2.jfif";
import Image3 from "../assets/image3.webp";
import Image4 from "../assets/image4.avif";
import { GetData } from "../services/ApiServices";


function Carousel3D() {
  const localImages = [Image1, Image2, Image3, Image4];
  const [images, setImages] = useState(localImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Autoplay
  useEffect(() => {
    const interval = setInterval(() => handleNext(), 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch images from API and use local images as fallback
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const data = await GetData('imagenesCarrusel/')
        if (!mounted) return
        if (Array.isArray(data) && data.length) {
          // solo imágenes con estado 'activa', map a urls
          const urls = data.filter(item => item.estado === 'activa').map(item => item.url).filter(Boolean)
          if (urls.length) setImages(urls)
        }
      } catch (err) {
        // leave fallback images
        console.error('Error cargando imágenes del carrusel:', err)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handlePrev = () => { setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); };
  const handleNext = () => { setCurrentIndex((prev) => (prev + 1) % images.length); };

  const handleTouchStart = (e) => { touchStartX.current = e.changedTouches[0].screenX; };
  const handleTouchEnd = (e) => { touchEndX.current = e.changedTouches[0].screenX; if (touchStartX.current - touchEndX.current > 50) handleNext(); if (touchEndX.current - touchStartX.current > 50) handlePrev(); };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center bg-[#adb6aaa8] dark:bg-[#171731]" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="relative w-[58%]  md:w-[450px] h-[250px] md:h-[320px]" style={{ transformStyle: "preserve-3d", transform: `perspective(1000px) rotateY(${currentIndex * -360 / images.length}deg)`, transition: "transform 1s ease-in-out" }}>
        {images.map((src, i) => {
          const angle = (360 / images.length) * i;
          return <img key={i} src={src} alt={`Slide ${i + 1}`} className="absolute w-full h-full object-contain rounded-xl" style={{ transform: `rotateY(${angle}deg) translateZ(400px)`, transition: "transform 1s ease-in-out" }} />;
        })}
      </div>

      <button onClick={handlePrev} className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-gray-900 rounded-full p-3 transition">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 6 10"><path d="M5 1 1 5l4 4" /></svg>
      </button>

      <button onClick={handleNext} className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-gray-900 rounded-full p-3 transition">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 6 10"><path d="m1 9 4-4-4-4" /></svg>
      </button>

      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button key={index} onClick={() => setCurrentIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-white scale-125" : "bg-gray-400 hover:bg-gray-300"}`} />
        ))}
      </div>
    </div>
  );
}

export default Carousel3D;
