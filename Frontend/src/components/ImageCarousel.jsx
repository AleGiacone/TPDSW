
import React, { useState } from 'react';

const ImageCarousel = ({ imagenes, titulo }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const totalImages = imagenes?.length || 0;
    
    console.log(' ImageCarousel recibió:', { imagenes, totalImages });
    
    if (!imagenes || imagenes.length === 0) {
        return (
            <div className="carousel-placeholder">
                <span style={{ fontSize: '30px' }}>📸</span>
                <span>Sin foto</span>
            </div>
        );
    }
    
    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % totalImages);
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + totalImages) % totalImages);
    };

    const currentImage = imagenes[currentImageIndex];
    const imageUrl = currentImage.url || `http://localhost:3000${currentImage.path}`;
    
    console.log(' Renderizando imagen:', imageUrl);

    return (
        <div className="carousel-container">
            <img 
                src={imageUrl}
                alt={`Foto de ${titulo || 'publicación'}`}
                className="carousel-image"
                onError={(e) => {
                    console.error(' Error cargando imagen:', imageUrl);
                    e.target.src = 'https://via.placeholder.com/400x300?text=Imagen+no+disponible';
                }}
            />
            {totalImages > 1 && (
                <>
                    <button onClick={prevImage} className="carousel-nav prev">
                        &lt;
                    </button>
                    <button onClick={nextImage} className="carousel-nav next">
                        &gt;
                    </button>
                    <div className="carousel-dots">
                        {imagenes.map((_, index) => (
                            <span 
                                key={index}
                                className={`dot ${index === currentImageIndex ? 'active' : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                            ></span>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ImageCarousel;