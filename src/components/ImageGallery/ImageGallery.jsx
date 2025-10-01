import React, { useContext } from 'react';
import { Context } from '../../context/ContextProvider';
import './ImageGallery.css';

const ImageGallery = () => {
    const { generatedImages } = useContext(Context);

    return (
        <div className="image-gallery-container">
            <div className="image-grid">
                {generatedImages.map((image, index) => (
                    <div key={index} className="grid-item">
                        <img src={image.imageUrl} alt={image.prompt} />
                        <div className="grid-item-info">
                            <p>{image.prompt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
