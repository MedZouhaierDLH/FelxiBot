import React, { useState } from 'react';
import '../styles/chat.css';

const ApiKeyModal = ({ onSave }) => {
    const [key, setKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (key.trim()) {
            onSave(key.trim());
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Enter Gemini API Key</h2>
                <p style={{ marginBottom: '20px', color: '#94a3b8' }}>
                    To use the Demand Response Chatbot, please provide your Gemini API key.
                </p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        className="api-input"
                        placeholder="Paste your API key here..."
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        required
                    />
                    <button type="submit" className="save-button">
                        Start Chatting
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApiKeyModal;
