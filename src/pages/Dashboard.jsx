import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import KPICard from '../components/KPICard';
import FileUpload from '../components/FileUpload';
import DataChart from '../components/DataChart';
import DataStats from '../components/DataStats';
import '../styles/dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { uploads, currentData, setCurrentData } = useData();

    const handleUploadComplete = (upload) => {
        // Auto-select the newly uploaded data
        setCurrentData(upload);
    };

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p>Monitor grid performance and manage demand response</p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard
                    title="Current Load"
                    value={currentData?.data?.length > 0 ? `${currentData.data[currentData.data.length - 1]?.value.toFixed(2)} MW` : '--'}
                    subtitle="Real-time"
                    icon="⚡"
                    trend={currentData?.data?.length > 0 ? { direction: 'up', value: '2.3%' } : null}
                />
                <KPICard
                    title="Peak Risk Level"
                    value="Medium"
                    subtitle="Next 4 hours"
                    icon="📊"
                />
                <KPICard
                    title="Active Data Sets"
                    value={uploads.length}
                    subtitle="Uploaded"
                    icon="📁"
                />
                <KPICard
                    title="Forecast Ready"
                    value={currentData ? "Yes" : "No"}
                    subtitle="Analysis available"
                    icon="🔮"
                />
            </div>

            {/* Main Content */}
            <div className="dashboard-content">
                <div className="dashboard-column">
                    {/* File Upload */}
                    <FileUpload onUploadComplete={handleUploadComplete} />

                    {/* Quick Actions */}
                    <div className="quick-actions-panel">
                        <h3>Quick Actions</h3>
                        <div className="action-buttons">
                            <button onClick={() => navigate('/chat')} className="action-btn primary">
                                💬 Ask AI Assistant
                            </button>
                            <button onClick={() => navigate('/forecast')} className="action-btn" disabled={!currentData}>
                                📈 Generate Forecast
                            </button>
                            <button className="action-btn" disabled>
                                🎯 Create Campaign
                            </button>
                        </div>
                    </div>

                    {/* Recent Uploads */}
                    {uploads.length > 0 && (
                        <div className="recent-uploads-panel">
                            <h3>Recent Uploads</h3>
                            <div className="uploads-list">
                                {uploads.slice(0, 5).map(upload => (
                                    <div
                                        key={upload.id}
                                        className={`upload-item ${currentData?.id === upload.id ? 'active' : ''}`}
                                        onClick={() => setCurrentData(upload)}
                                    >
                                        <span className="upload-icon">📄</span>
                                        <div className="upload-info">
                                            <span className="upload-name">{upload.filename}</span>
                                            <span className="upload-meta">{upload.rowCount} rows • {new Date(upload.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Visualization Column */}
                <div className="dashboard-column viz-column">
                    {currentData ? (
                        <>
                            <DataChart
                                data={currentData.data}
                                title={`Load Profile: ${currentData.filename}`}
                                type="area"
                            />
                            <DataStats data={currentData.data} />
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📊</div>
                            <h3>No Data Selected</h3>
                            <p>Upload a CSV file to visualize meter data and get insights</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
