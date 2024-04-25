import React from 'react';
import '../styles/CustomModal.scss';

const CustomModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-message">{message}</div>
                <button className="modal-close" onClick={onClose}>X</button>
            </div>
        </div>
    );
}

export default CustomModal;