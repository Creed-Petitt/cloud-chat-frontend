import React, { useContext, useState } from 'react';
import { Context } from '../../context/ContextProvider';
import ImageModal from '../ImageModal/ImageModal';
import './ImageGallery.css';

const ImageGallery = () => {
    const { generatedImages } = useContext(Context);
    const [selectedImage, setSelectedImage] = useState(null);

    return (
        <div className="image-gallery-container">
            <div className="image-grid">
                {generatedImages.map((image, index) => (
                    <div key={index} className="grid-item">
                        <img
                            src={image.imageUrl}
                            alt={image.prompt}
                            onClick={() => setSelectedImage(image)}
                        />
                        <div className="grid-item-info">
                            <p>{image.prompt}</p>
                        </div>
                    </div>
                ))}
            </div>
            <ImageModal
                imageUrl={selectedImage?.imageUrl}
                prompt={selectedImage?.prompt}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div>
    );
};

export default ImageGallery;
