import { useEffect } from 'react';
import './ImageModal.css';

const ImageModal = ({ imageUrl, prompt, isOpen, onClose }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="image-modal-overlay" onClick={onClose}>
            <img src={imageUrl} alt={prompt} className="image-modal-img" onClick={(e) => e.stopPropagation()} />
        </div>
    );
};

export default ImageModal;
