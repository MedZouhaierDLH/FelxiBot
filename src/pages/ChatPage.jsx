import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { useData } from '../context/DataContext';

const ChatPage = ({ apiKey, sessions, currentSessionId, onMessagesUpdate, onInvalidKey }) => {
    const { currentData } = useData();

    // Find current session
    const currentSession = sessions.find(s => s.id === currentSessionId);

    // Build enhanced context with uploaded data info
    const enhancedContext = currentData ?
        `\n\n[Context: User has uploaded data from ${currentData.filename} with ${currentData.rowCount} data points. Latest value: ${currentData.data[currentData.data.length - 1]?.value} kWh]`
        : '';

    return (
        <div className="chat-page">
            {currentSession ? (
                <ChatInterface
                    apiKey={apiKey}
                    messages={currentSession.messages}
                    onMessagesUpdate={onMessagesUpdate}
                    onInvalidKey={onInvalidKey}
                    dataContext={enhancedContext}
                />
            ) : (
                <div className="no-chat-selected">Select or create a chat</div>
            )}
        </div>
    );
};

export default ChatPage;
