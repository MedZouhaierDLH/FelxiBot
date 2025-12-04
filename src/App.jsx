import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import ForecastPage from './pages/ForecastPage';
import SegmentationPage from './pages/SegmentationPage';
import SimulatorPage from './pages/SimulatorPage';
import CampaignsPage from './pages/CampaignsPage';
import ApiKeyModal from './components/ApiKeyModal';
import './styles/chat.css';
import './styles/global.css';

function App() {
    const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
    const [sessions, setSessions] = useState(() => {
        try {
            const saved = localStorage.getItem('chat_sessions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse chat_sessions:", e);
            return [];
        }
    });
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        localStorage.setItem('chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    useEffect(() => {
        localStorage.setItem('theme', theme);
    }, [theme]);

    const createNewSession = () => {
        const newSession = {
            id: Date.now(),
            title: 'New Chat',
            messages: [
                {
                    id: 1,
                    text: "Hello! I'm GridAssist, your Demand Response expert. I can help you analyze meter data, forecast loads, and plan DR campaigns. What would you like to explore?",
                    sender: 'bot',
                    timestamp: new Date()
                }
            ]
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newSession.id);
    };

    const updateSessionMessages = (sessionId, newMessages) => {
        setSessions(prev => prev.map(session => {
            if (session.id === sessionId) {
                let title = session.title;
                if (title === 'New Chat' && newMessages.length > 1) {
                    const firstUserMsg = newMessages.find(m => m.sender === 'user');
                    if (firstUserMsg) {
                        title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
                    }
                }
                return { ...session, title, messages: newMessages };
            }
            return session;
        }));
    };

    const deleteSession = (id) => {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (currentSessionId === id) {
            setCurrentSessionId(null);
        }
    };

    const handleSaveKey = (key) => {
        setApiKey(key);
        localStorage.setItem('gemini_api_key', key);
    };

    const resetApiKey = () => {
        setApiKey('');
        localStorage.removeItem('gemini_api_key');
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Initialize a session if none exists
    useEffect(() => {
        if (sessions.length === 0 && apiKey) {
            createNewSession();
        } else if (sessions.length > 0 && !currentSessionId) {
            setCurrentSessionId(sessions[0].id);
        }
    }, [apiKey]);

    return (
        <DataProvider>
            <BrowserRouter>
                <div className={`app-container ${theme === 'light' ? 'light-mode' : ''}`}>
                    {!apiKey && <ApiKeyModal onSave={handleSaveKey} />}
                    {apiKey && (
                        <>
                            <Sidebar
                                sessions={sessions}
                                currentSessionId={currentSessionId}
                                onSelectSession={setCurrentSessionId}
                                onNewChat={createNewSession}
                                onDeleteSession={deleteSession}
                                onChangeApiKey={resetApiKey}
                                theme={theme}
                                onToggleTheme={toggleTheme}
                            />
                            <div className="main-content">
                                <Routes>
                                    <Route path="/" element={<Dashboard />} />
                                    <Route path="/chat" element={
                                        <ChatPage
                                            apiKey={apiKey}
                                            sessions={sessions}
                                            currentSessionId={currentSessionId}
                                            onMessagesUpdate={(msgs) => updateSessionMessages(currentSessionId, msgs)}
                                            onInvalidKey={resetApiKey}
                                        />
                                    } />
                                    <Route path="/forecast" element={<ForecastPage />} />
                                    <Route path="/segmentation" element={<SegmentationPage />} />
                                    <Route path="/simulator" element={<SimulatorPage />} />
                                    <Route path="/campaigns" element={<CampaignsPage />} />
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                            </div>
                        </>
                    )}
                </div>
            </BrowserRouter>
        </DataProvider>
    );
}

export default App;
