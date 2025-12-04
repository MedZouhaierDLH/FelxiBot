import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/chat.css';

const Sidebar = ({ sessions, currentSessionId, onSelectSession, onNewChat, onDeleteSession, onChangeApiKey, theme, onToggleTheme }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { path: '/', icon: '🏠', label: 'Dashboard' },
        { path: '/chat', icon: '💬', label: 'Chat' },
        { path: '/forecast', icon: '📈', label: 'Forecast' },
        { path: '/segmentation', icon: '🎯', label: 'Segments' },
        { path: '/simulator', icon: '⚡', label: 'Simulator' },
        { path: '/campaigns', icon: '📢', label: 'Campaigns' }
    ];

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <span className="brand-icon">⚡</span>
                <span className="brand-name">GridAssist</span>
            </div>

            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <button
                        key={item.path}
                        className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        onClick={() => navigate(item.path)}
                        title={item.label}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-divider"></div>

            {location.pathname === '/chat' && (
                <>
                    <div className="sidebar-header">
                        <button onClick={onNewChat} className="new-chat-btn">
                            + New Chat
                        </button>
                    </div>
                    <div className="sessions-list">
                        {sessions.map(session => (
                            <div
                                key={session.id}
                                className={`session-item ${session.id === currentSessionId ? 'active' : ''}`}
                                onClick={() => onSelectSession(session.id)}
                            >
                                <span className="session-title" title={session.title}>
                                    {session.title || 'New Chat'}
                                </span>
                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteSession(session.id);
                                    }}
                                    title="Delete chat"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="sidebar-footer">
                <button onClick={onToggleTheme} className="theme-toggle-btn" title="Toggle Theme">
                    {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
                </button>
                <button onClick={onChangeApiKey} className="change-key-btn">
                    🔑 API Key
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
