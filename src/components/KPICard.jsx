import React from 'react';
import '../styles/dashboard.css';

const KPICard = ({ title, value, subtitle, trend, icon }) => {
    return (
        <div className="kpi-card">
            <div className="kpi-header">
                <span className="kpi-icon">{icon}</span>
                <span className="kpi-title">{title}</span>
            </div>
            <div className="kpi-value">{value}</div>
            {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
            {trend && (
                <div className={`kpi-trend ${trend.direction}`}>
                    {trend.direction === 'up' ? '↑' : '↓'} {trend.value}
                </div>
            )}
        </div>
    );
};

export default KPICard;
