import React from 'react';
import { calculateStats } from '../utils/dataProcessor';
import '../styles/dashboard.css';

const DataStats = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="data-stats-empty">
                <p>Upload data to see statistics</p>
            </div>
        );
    }

    const stats = calculateStats(data);

    if (!stats) {
        return null;
    }

    return (
        <div className="data-stats-panel">
            <h3>Statistics</h3>
            <div className="stats-grid">
                <div className="stat-item">
                    <span className="stat-label">Total Consumption</span>
                    <span className="stat-value">{stats.total} {stats.unit}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Average</span>
                    <span className="stat-value">{stats.average} {stats.unit}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Peak Load</span>
                    <span className="stat-value">{stats.max} {stats.unit}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Min Load</span>
                    <span className="stat-value">{stats.min} {stats.unit}</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">Data Points</span>
                    <span className="stat-value">{stats.count}</span>
                </div>
                {stats.peakTime && (
                    <div className="stat-item stat-highlight">
                        <span className="stat-label">Peak Time</span>
                        <span className="stat-value">{stats.peakTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataStats;
