import React from 'react';
import '../styles/chat.css';

const ActionButtons = ({ message, onVisualize, onExport, onRecommend }) => {
    // Only show for bot messages
    if (message.sender !== 'bot') return null;

    // Check if message contains data analysis
    const hasData = message.text.toLowerCase().includes('data') ||
        message.text.toLowerCase().includes('load') ||
        message.text.toLowerCase().includes('peak');

    return (
        <div className="action-buttons-container">
            {hasData && (
                <button
                    className="action-btn-small"
                    onClick={() => onVisualize(message)}
                    title="Visualize mentioned data"
                >
                    📊 Visualize
                </button>
            )}
            <button
                className="action-btn-small"
                onClick={() => onExport(message)}
                title="Export this conversation"
            >
                📤 Export
            </button>
            <button
                className="action-btn-small primary-action"
                onClick={() => onRecommend(message)}
                title="Get DR recommendations"
            >
                💡 Recommendations
            </button>
        </div>
    );
};

export default ActionButtons;
