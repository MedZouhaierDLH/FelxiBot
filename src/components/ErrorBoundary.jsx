import React from 'react';
import '../styles/dashboard.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        localStorage.clear();
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="dashboard-page" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="empty-state">
                        <div className="empty-icon" style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
                        <h2 style={{ color: 'var(--text-color)', marginBottom: '10px' }}>Something went wrong</h2>
                        <p style={{ color: '#94a3b8', marginBottom: '20px', maxWidth: '500px' }}>
                            The application encountered an unexpected error. This is often caused by corrupted local data.
                        </p>

                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'left', width: '100%', maxWidth: '600px', overflow: 'auto' }}>
                            <code style={{ color: '#ef4444', fontFamily: 'monospace' }}>
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <button
                            onClick={this.handleReset}
                            className="upload-button"
                            style={{ background: '#ef4444' }}
                        >
                            Clear Data & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
