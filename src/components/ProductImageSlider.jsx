import { LucideArrowLeft, LucideArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ProductSlider({ images = [], autoPlay = true, interval = 4000 }) {

  // CASO: SOLO UNA IMAGEN
  if (images.length <= 1) {
    return (
      <div className="w-[100%] mx-auto">
        <div className="w-full h-[400px] sm:h-[300px]">
          <img
            src={images[0]}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  // =============================
  // SLIDER INFINITO (2+ imágenes)
  // =============================
  const sliderRef = useRef(null);
  const [index, setIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const sliderImages = [
    images[images.length - 1],
    ...images,
    images[0],
  ];

  const slideWidth = 100;

  // Autoplay
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      next();
    }, interval);

    return () => clearInterval(id);
  }, [index]);

  // Ajuste invisible
  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const next = () => setIndex((prev) => prev + 1);
  const prev = () => setIndex((prev) => prev - 1);

  const handleTransitionEnd = () => {
    if (index === sliderImages.length - 1) {
      setIsAnimating(false);
      setIndex(1);
    }

    if (index === 0) {
      setIsAnimating(false);
      setIndex(sliderImages.length - 2);
    }
  };

  // TOUCH EVENTS
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };

  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    currentX.current = e.touches[0].clientX;
  };

  const onTouchEnd = () => {
    const diff = startX.current - currentX.current;

    if (diff > 50) next();
    if (diff < -50) prev();

    isDragging.current = false;
  };

  return (
    <div className="relative w-full md:w-[90%] overflow-hidden">
      <div
        ref={sliderRef}
        className={`flex ${
          isAnimating ? "transition-transform duration-500 ease-in-out" : ""
        }`}
        style={{
          transform: `translateX(-${index * slideWidth}%)`,
        }}
        onTransitionEnd={handleTransitionEnd}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {sliderImages.map((img, i) => (
          <div key={i} className="min-w-full h-[400px] sm:h-[350px]">
            <img
              src={img}
              alt=""
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        ))}
      </div>

      {/* Botones SOLO desktop */}
      <div className="hidden md:flex absolute inset-0 items-center justify-between px-6">
        <button
          onClick={prev}
          className="bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
        >
          <LucideArrowLeft />
        </button>
        <button
          onClick={next}
          className="bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center"
        >
          <LucideArrowRight />
        </button>
      </div>
    </div>
  );
}
