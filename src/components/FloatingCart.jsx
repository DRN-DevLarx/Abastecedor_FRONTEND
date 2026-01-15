import React, { useState, useEffect } from 'react';
import { Heart, ChevronLeft, ChevronRight, Star, ArrowLeft, ShoppingCart, HeartPlus, HeartPlusIcon, X, Trash2, Move } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOVE_THRESHOLD = 5; // px

// Componente del Carrito Flotante Arrastrable con Snap
export const FloatingCart = ({ items = [], onRemoveItem }) => {
  const navigate = useNavigate()
  const [side, setSide] = useState('right'); // 'left' o 'right'
  const [yPosition, setYPosition] = useState(50); // Porcentaje vertical (0-100)
  const [isDragging, setIsDragging] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPosition, setTempPosition] = useState({ x: 0, y: 0 });

  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const getActualPosition = () => {
    const padding = 20;
    const buttonSize = 30;
    
    // AQUÍ: Cambia estos valores para limitar verticalmente
    const minY = 0;      // Mínimo desde arriba (aumenta para más margen superior)
    const maxY = window.innerHeight - 125; // Máximo desde abajo (reduce para más margen inferior)
    
    const clampedY = Math.max(minY, Math.min(window.innerHeight * yPosition / 100, maxY));
    
    return {
      x: side === 'right' 
        ? Math.min(window.innerWidth - buttonSize - padding, window.innerWidth - buttonSize) 
        : Math.max(padding, buttonSize),
      y: clampedY
    };
  };

  const startDrag = (clientX, clientY) => {

    const pos = getActualPosition();
    setIsDragging(true);
    setHasMoved(false);
    setTempPosition(pos);

    setDragOffset({
      x: clientX - pos.x,
      y: clientY - pos.y,
    });
  };  
  
  const handleMouseDown = (e) => startDrag(e.clientX, e.clientY);
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };

  // Resize
  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Manejar movimiento del arrastre
  useEffect(() => {
    const move = (clientX, clientY) => {
      if (!isDragging) return;

      // Margin inferior según breakpoint
      const isMobile = viewport.width < 768;
      const bottomMargin = isMobile ? 120 : 60;
      const maxY = viewport.height - bottomMargin;

      const dx = Math.abs(clientX - (tempPosition.x + dragOffset.x));
      const dy = Math.abs(clientY - (tempPosition.y + dragOffset.y));

      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        setHasMoved(true);
      }

      setTempPosition({
        x: clientX - dragOffset.x,
        y: Math.max(30, Math.min(clientY - dragOffset.y, maxY)),
      });
    };

    const mouseMove = (e) => move(e.clientX, e.clientY);
    const touchMove = (e) =>
      move(e.touches[0].clientX, e.touches[0].clientY);

    const end = () => {
      if (!isDragging) return;

      setIsDragging(false);

      if (!hasMoved) return;

      const center = viewport.width / 2;
      const newSide = tempPosition.x < center ? "left" : "right";
      const newY = Math.max(
        5,
        Math.min(95, (tempPosition.y / viewport.height) * 100)
      );

      setSide(newSide);
      setYPosition(newY);
    };

    if (isDragging) {
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", end);
      document.addEventListener("touchmove", touchMove);
      document.addEventListener("touchend", end);
    }

    return () => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", end);
      document.removeEventListener("touchmove", touchMove);
      document.removeEventListener("touchend", end);
    };
  }, [isDragging, dragOffset, tempPosition, hasMoved, viewport]);

  // Obtener la posición actual para renderizar
  const displayPosition = isDragging ? tempPosition : getActualPosition();

  return (
    <>
      {/* Botón del carrito flotante arrastrable */}
      <div
        style={{
          position: 'fixed',
          left: `${displayPosition.x}px`,
          top: `${displayPosition.y}px`,
          transform: 'translate(-50%, -50%)',
          zIndex: 50,
          transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        id="floating-cart-button"
        className="touch-none select-none"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasMoved) return;
            navigate("/carrito")
          }}
          className=" md:top-15 bg-[#38664e] hover:bg-[#288655] text-white p-4 rounded-full shadow-xl relative"
        >
          <ShoppingCart size={24} />

          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-6 h-6 rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}

            <span className="absolute -bottom-1 -right-1 bg-gray-700 p-1 rounded-full">
              <Move size={12} />
            </span>
          
        </button>
      </div>

    </>
  );
};