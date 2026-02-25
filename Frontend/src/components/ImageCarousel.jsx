

import React, { useState } from 'react';

const ImageCarousel = ({ imagenes, titulo }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const totalImages = imagenes?.length || 0;

    if (!imagenes || imagenes.length === 0) {
        return (
            <div className="carousel-placeholder">
                <span style={{ fontSize: '3rem' }}>📸</span>
                <span>Sin foto</span>
            </div>
        );
    }

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % totalImages);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
    };

    const goToSlide = (index, e) => {
        e.stopPropagation();
        setCurrentImageIndex(index);
    };

    const currentImage = imagenes[currentImageIndex];
    const imageUrl = currentImage.url || `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${currentImage.path}`;

    return (
        <div className="carousel-container">
            <img
                src={imageUrl}
                alt={`Foto de ${titulo || 'publicación'} - ${currentImageIndex + 1}/${totalImages}`}
                className="carousel-image"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' fill='%23666666' dominant-baseline='middle' text-anchor='middle' font-size='20'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
                }}
            />

            {totalImages > 1 && (
                <>
                    <button onClick={prevImage} className="carousel-nav prev">‹</button>
                    <button onClick={nextImage} className="carousel-nav next">›</button>
                    <div className="carousel-dots">
                        {imagenes.map((_, index) => (
                            <span
                                key={index}
                                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={(e) => goToSlide(index, e)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageCarousel;